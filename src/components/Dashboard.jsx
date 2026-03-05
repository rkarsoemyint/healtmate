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

    // ၁။ ဒီနေ့ မနက် (00:00:00) အချိန်ကို သတ်မှတ်ခြင်း
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const unsubscribers = [];

    try {
      // ၂။ BMI Query (နောက်ဆုံးမှတ်တမ်း ၁ ခု)
      const bmiQ = query(
        collection(db, 'health_logs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const unsubBmi = onSnapshot(bmiQ, (snapshot) => {
        if (!snapshot.empty) setLastBmi(snapshot.docs[0].data());
      });
      unsubscribers.push(unsubBmi);

      // ၃။ Meals & Nutrients Query (ယနေ့အတွက်သာ)
      const mealQ = query(
        collection(db, 'meals'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', startOfToday),
        orderBy('createdAt', 'desc')
      );
      const unsubMeals = onSnapshot(mealQ, (snapshot) => {
        let totalCal = 0, totalP = 0, totalC = 0, totalZ = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalCal += Number(data.calories || 0);
          totalP += Number(data.protein || 0);
          totalC += Number(data.carbs || 0);
          totalZ += Number(data.zinc || 0);
        });
        setTodayCalories(totalCal);
        setNutrients({ protein: totalP, carbs: totalC, zinc: totalZ });
      });
      unsubscribers.push(unsubMeals);

      // ၄။ Water Logs Query (ယနေ့အတွက်သာ)
      const waterQ = query(
        collection(db, 'water_logs'),
        where('userId', '==', user.uid),
        where('createdAt', '>=', startOfToday),
        orderBy('createdAt', 'desc')
      );
      const unsubWater = onSnapshot(waterQ, (snapshot) => {
        const total = snapshot.docs.reduce((sum, doc) => sum + Number(doc.data().amount || 0), 0);
        setWaterIntake(total);
      });
      unsubscribers.push(unsubWater);

    } catch (err) {
      console.error("Dashboard Setup Error:", err);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">မင်္ဂလာပါ၊ {userName}! 👋</h1>
        <p className="text-gray-500 font-medium">ယနေ့အတွက် သင့်ကျန်းမာရေး အနှစ်ချုပ်ကို ကြည့်လိုက်ရအောင်။</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* BMI Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Activity size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BMI Status</p>
            <h3 className="text-2xl font-black text-gray-800">{lastBmi?.bmi || 'N/A'}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lastBmi?.status === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {lastBmi?.status || 'No Data'}
            </span>
          </div>
        </div>

        {/* Calories Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Utensils size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Calories</p>
            <h3 className="text-2xl font-black text-gray-800">{todayCalories} <span className="text-xs font-normal text-gray-400">kcal</span></h3>
            <div className="w-24 bg-gray-100 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-orange-500 h-full" style={{ width: `${Math.min((todayCalories/2000)*100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Water Intake Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-cyan-50 p-4 rounded-2xl text-cyan-600"><Droplets size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Water Intake</p>
            <h3 className="text-2xl font-black text-gray-800">{waterIntake} <span className="text-xs font-normal text-gray-400">ml</span></h3>
            <p className="text-[10px] font-bold text-cyan-600">{Math.min(((waterIntake/2000)*100), 100).toFixed(0)}% of goal</p>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="bg-purple-50 p-4 rounded-2xl text-purple-600"><Award size={28} /></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Health Score</p>
            <h3 className="text-2xl font-black text-gray-800">85%</h3>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-tighter">Excellent</p>
          </div>
        </div>
      </div>

      {/* Nutrient Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" /> ယနေ့ အာဟာရဓာတ် စုစုပေါင်း
            </h3>
            <span className="text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-500 uppercase">Live Updates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protein */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black text-gray-400 uppercase">Protein</p>
                <p className="font-black text-blue-600">{nutrients.protein}g</p>
              </div>
              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min((nutrients.protein/50)*100, 100)}%` }}></div>
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black text-gray-400 uppercase">Carbs</p>
                <p className="font-black text-green-600">{nutrients.carbs}g</p>
              </div>
              <div className="h-2 bg-green-50 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${Math.min((nutrients.carbs/250)*100, 100)}%` }}></div>
              </div>
            </div>

            {/* Zinc */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-xs font-black text-gray-400 uppercase">Zinc</p>
                <p className="font-black text-purple-600">{nutrients.zinc}mg</p>
              </div>
              <div className="h-2 bg-purple-50 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${Math.min((nutrients.zinc/11)*100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className="text-xl font-black mb-4 tracking-tight">Health Tip! 💡</h2>
          <p className="text-blue-50 text-sm leading-relaxed font-medium opacity-90">
            နေ့စဉ် ရေများများသောက်ပေးခြင်းက သင့်ဦးနှောက်စွမ်းဆောင်ရည်ကို ၁၄% ထိ မြှင့်တင်ပေးနိုင်ပါတယ်။
          </p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 uppercase tracking-widest">
            <TrendingUp size={14} /> Stay Hydrated
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;