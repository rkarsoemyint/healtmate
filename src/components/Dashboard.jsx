import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Activity, Utensils, TrendingUp, Award, Droplets, Zap } from 'lucide-react';

const Dashboard = () => {
  const [lastBmi, setLastBmi] = useState(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [nutrients, setNutrients] = useState({ protein: 0, carbs: 0, zinc: 0 });
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    setUserName(user.displayName || user.email.split('@')[0]);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Error ကင်းဝေးစေရန် Unsubscribe လုပ်မည့် function များကို array ထဲသိမ်းမည်
    const unsubscribers = [];

    try {
      // ၁။ BMI Query
      const bmiQ = query(
        collection(db, 'health_logs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const unsubBmi = onSnapshot(bmiQ, (snapshot) => {
        if (!snapshot.empty) setLastBmi(snapshot.docs[0].data());
      }, (error) => console.error("BMI Listener Error:", error));
      unsubscribers.push(unsubBmi);

      // ၂။ Meals & Nutrients Query
      const mealQ = query(
        collection(db, 'meals'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', startOfToday)
      );
      const unsubMeals = onSnapshot(mealQ, (snapshot) => {
        let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalZinc = 0;
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalCal += Number(data.calories || 0);
          totalProtein += Number(data.protein || 0);
          totalCarbs += Number(data.carbs || 0);
          totalZinc += Number(data.zinc || 0);
        });

        setTodayCalories(totalCal);
        setNutrients({ protein: totalProtein, carbs: totalCarbs, zinc: totalZinc });
      }, (error) => console.error("Meal Listener Error:", error));
      unsubscribers.push(unsubMeals);

      // ၃။ Water Query
      const waterQ = query(
        collection(db, 'water_logs'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', startOfToday)
      );
      const unsubWater = onSnapshot(waterQ, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => sum + Number(doc.data().amount || 0), 0);
        setWaterIntake(total);
      }, (error) => console.error("Water Listener Error:", error));
      unsubscribers.push(unsubWater);

    } catch (err) {
      console.error("Dashboard Setup Error:", err);
    }

    // Cleanup: Component မှ ထွက်သည့်အခါ Listener အားလုံးကို စနစ်တကျ ပိတ်ခြင်း
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">မင်္ဂလာပါ၊ {userName}! 👋</h1>
        <p className="text-gray-500 italic">ယနေ့အတွက် သင့်ရဲ့ ကျန်းမာရေး အနှစ်ချုပ်။</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* BMI Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-blue-100 p-4 rounded-2xl text-blue-600"><Activity size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">လက်ရှိ BMI</p>
            <h3 className="text-2xl font-bold text-gray-800">{lastBmi?.bmi || 'N/A'}</h3>
            <p className={`text-xs font-bold ${lastBmi?.status === 'Normal' ? 'text-green-500' : 'text-orange-500'}`}>
              {lastBmi?.status || 'မှတ်တမ်းမရှိ'}
            </p>
          </div>
        </div>

        {/* Calories Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600"><Utensils size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">ယနေ့ ကယ်လိုရီ</p>
            <h3 className="text-2xl font-bold text-gray-800">{todayCalories} <span className="text-sm font-normal text-gray-400">kcal</span></h3>
            <p className="text-xs text-gray-400">Target: 2000</p>
          </div>
        </div>

        {/* Water Intake Card with Progress Bar */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500"><Droplets size={28} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">ရေသောက်နှုန်း</p>
              <h3 className="text-2xl font-bold text-gray-800">{waterIntake} <span className="text-sm font-normal text-gray-400">ml</span></h3>
            </div>
          </div>
          <div className="w-full space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-blue-600">
              <span>{Math.min(((waterIntake / 2000) * 100), 100).toFixed(0)}%</span>
              <span>Goal: 2000ml</span>
            </div>
            <div className="w-full bg-blue-50 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((waterIntake / 2000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-purple-100 p-4 rounded-2xl text-purple-600"><Award size={28} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">ကျန်းမာရေး အမှတ်</p>
            <h3 className="text-2xl font-bold text-gray-800">85%</h3>
            <p className="text-xs text-green-500 font-bold">Keep it up!</p>
          </div>
        </div>
      </div>

      {/* Nutrient Summary Section (အသစ်ဖြည့်စွက်ချက်) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> ယနေ့ အာဟာရဓာတ် စုစုပေါင်း
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-bold uppercase">Protein</p>
              <p className="text-xl font-black text-blue-600">{nutrients.protein}g</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-bold uppercase">Carbs</p>
              <p className="text-xl font-black text-green-600">{nutrients.carbs}g</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs text-gray-400 font-bold uppercase">Zinc</p>
              <p className="text-xl font-black text-purple-600">{nutrients.zinc}mg</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-2">ကျန်းမာခြင်းသည် လာဘ်တစ်ပါး!</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            နေ့စဉ် ရေများများသောက်ပြီး အမျှင်ဓာတ်ပါတဲ့ အစားအစာတွေကို ပိုမိုစားသုံးဖို့ မမေ့ပါနဲ့။
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
            <TrendingUp size={14} /> Keep Growing!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;