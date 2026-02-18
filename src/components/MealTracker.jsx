import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Utensils, Info } from 'lucide-react';

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

    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

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
      
      // Input များကို ရှင်းလင်းခြင်း
      setMealName(''); setCalories(''); setProtein(''); 
      setCarbs(''); setZinc(''); setVitamin('');
    } catch (err) {
      console.error("Error adding meal:", err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Utensils className="text-blue-600" /> Advanced Nutrition Tracker
      </h2>

      {/* အာဟာရစုံလင်စွာ ထည့်သွင်းရန် Form */}
      <form onSubmit={handleAddMeal} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">အစားအသောက်အမည်</label>
            <input
              type="text"
              placeholder="ဥပမာ - ကြက်သားဆန်ပြုတ်"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">ကယ်လိုရီ (kcal)</label>
            <input
              type="number"
              placeholder="ကယ်လိုရီ"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Protein (g)</label>
            <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={protein} onChange={(e) => setProtein(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Carbs (g)</label>
            <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Zinc (mg)</label>
            <input type="number" placeholder="0" className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500" value={zinc} onChange={(e) => setZinc(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Vitamins</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-white" value={vitamin} onChange={(e) => setVitamin(e.target.value)}>
              <option value="">ရွေးရန်</option>
              <option value="A">Vitamin A</option>
              <option value="B Complex">Vitamin B</option>
              <option value="C">Vitamin C</option>
              <option value="D">Vitamin D</option>
              <option value="Multi">Multivitamin</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
          <PlusCircle size={20} /> မှတ်တမ်းတင်မည်
        </button>
      </form>

      {/* စားသောက်မှုစာရင်းပြသရန် */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <Info size={18} className="text-blue-500" /> ယနေ့စားသုံးမှုအသေးစိတ်
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {meals.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-300">
              <p className="text-gray-400 italic">မှတ်တမ်းမရှိသေးပါ။ အထက်တွင် ဖြည့်သွင်းပါ။</p>
            </div>
          ) : (
            meals.map((meal) => (
              <div key={meal.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{meal.name}</h4>
                    <p className="text-xs text-gray-400">{meal.createdAt?.toDate().toLocaleTimeString()}</p>
                  </div>
                  <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-black">
                    {meal.calories} kcal
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t pt-3 border-gray-50">
                  <div className="text-xs"><span className="text-gray-400">Protein:</span> <span className="font-bold text-blue-600">{meal.protein}g</span></div>
                  <div className="text-xs"><span className="text-gray-400">Carbs:</span> <span className="font-bold text-green-600">{meal.carbs}g</span></div>
                  <div className="text-xs"><span className="text-gray-400">Zinc:</span> <span className="font-bold text-purple-600">{meal.zinc}mg</span></div>
                  <div className="text-xs"><span className="text-gray-400">Vitamin:</span> <span className="font-bold text-pink-600">{meal.vitamin}</span></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MealTracker;