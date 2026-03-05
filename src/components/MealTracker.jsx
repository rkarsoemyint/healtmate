import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Utensils, Info, Flame, Target } from 'lucide-react';

const MealTracker = () => {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [zinc, setZinc] = useState('');
  const [vitamin, setVitamin] = useState('');
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // ၁။ ဒီနေ့ရက်စွဲရဲ့ အစ (00:00:00) ကို သတ်မှတ်ခြင်း
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ၂။ Query ထဲမှာ 'createdAt', '>=', today ဆိုပြီး Filter ထည့်ထားပါတယ်
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', today), // နောက်ရက်ဆို အလိုအလျောက် ပျောက်သွားပါလိမ့်မယ်
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // တစ်နေ့တာ စုစုပေါင်း ကယ်လိုရီ တွက်ချက်ရန်
  const totalCalories = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!mealName || !calories) return;

    try {
      await addDoc(collection(db, 'meals'), {
        userId: auth.currentUser.uid,
        name: mealName,
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        zinc: Number(zinc) || 0,
        vitamin: vitamin || 'None',
        createdAt: serverTimestamp()
      });
      
      setMealName(''); setCalories(''); setProtein(''); 
      setCarbs(''); setZinc(''); setVitamin('');
    } catch (err) {
      console.error("Error adding meal:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Utensils className="text-blue-600" /> Nutrition Tracker
        </h2>
        
        {/* တစ်နေ့တာ စုစုပေါင်း ကယ်လိုရီ ပြသရန် Card */}
        <div className="bg-orange-500 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-100">
          <Flame size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold opacity-80">Today's Total</p>
            <p className="text-lg font-black">{totalCalories} kcal</p>
          </div>
        </div>
      </div>

      {/* အာဟာရစုံလင်စွာ ထည့်သွင်းရန် Form */}
      <form onSubmit={handleAddMeal} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">အစားအသောက်အမည်</label>
            <input
              type="text"
              placeholder="ဥပမာ - ကြက်သားဆန်ပြုတ်"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">ကယ်လိုရီ (kcal)</label>
            <input
              type="number"
              placeholder="ကယ်လိုရီ"
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Protein (g)</label>
            <input type="number" placeholder="0" className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Carbs (g)</label>
            <input type="number" placeholder="0" className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Zinc (mg)</label>
            <input type="number" placeholder="0" className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={zinc} onChange={(e) => setZinc(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 ml-1">Vitamins</label>
            <select className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={vitamin} onChange={(e) => setVitamin(e.target.value)}>
              <option value="">ရွေးရန်</option>
              <option value="A">Vitamin A</option>
              <option value="B Complex">Vitamin B</option>
              <option value="C">Vitamin C</option>
              <option value="D">Vitamin D</option>
              <option value="Multi">Multivitamin</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 mt-2">
          <PlusCircle size={20} /> မှတ်တမ်းတင်မည်
        </button>
      </form>

      {/* စားသောက်မှုစာရင်းပြသရန် */}
      <div className="space-y-4 pb-10">
        <h3 className="font-bold text-gray-700 flex items-center gap-2 px-1">
          <Target size={18} className="text-blue-500" /> ယနေ့စားသုံးမှုမှတ်တမ်း
        </h3>
        
        {meals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm italic">ယနေ့အတွက် မှတ်တမ်းမရှိသေးပါ။</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {meals.map((meal) => (
              <div key={meal.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">{meal.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {meal.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-black border border-orange-100">
                      {meal.calories} kcal
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t pt-4 border-gray-50">
                  <div className="bg-blue-50/50 p-2 rounded-xl">
                    <p className="text-[9px] font-bold text-blue-400 uppercase">Protein</p>
                    <p className="font-bold text-blue-700">{meal.protein}g</p>
                  </div>
                  <div className="bg-green-50/50 p-2 rounded-xl">
                    <p className="text-[9px] font-bold text-green-400 uppercase">Carbs</p>
                    <p className="font-bold text-green-700">{meal.carbs}g</p>
                  </div>
                  <div className="bg-purple-50/50 p-2 rounded-xl">
                    <p className="text-[9px] font-bold text-purple-400 uppercase">Zinc</p>
                    <p className="font-bold text-purple-700">{meal.zinc}mg</p>
                  </div>
                  <div className="bg-pink-50/50 p-2 rounded-xl">
                    <p className="text-[9px] font-bold text-pink-400 uppercase">Vitamin</p>
                    <p className="font-bold text-pink-700">{meal.vitamin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealTracker;