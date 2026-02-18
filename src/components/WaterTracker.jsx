import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Droplets, Plus, GlassWater } from 'lucide-react';

const WaterTracker = () => {
  const [waterIntake, setWaterIntake] = useState(0);
  const goal = 2000;

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Query လုပ်တဲ့နေရာမှာ orderBy ခဏဖြုတ်ထားပါ (Index error မတက်အောင်)
    const q = query(
      collection(db, 'water_logs'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', startOfToday)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => {
        return sum + (Number(doc.data().amount) || 0);
      }, 0);
      setWaterIntake(total);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const addWater = async (amount) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'water_logs'), {
        userId: auth.currentUser.uid,
        amount: Number(amount),
        createdAt: serverTimestamp()
      });
      console.log("Water added:", amount);
    } catch (err) {
      console.error("Error adding water:", err);
    }
  };

  const percentage = Math.min((waterIntake / goal) * 100, 100);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <div className="mb-4 flex justify-between items-end">
           <span className="text-blue-600 font-bold text-lg">{Math.round(percentage)}%</span>
           <span className="text-gray-400 text-sm">{waterIntake} / {goal} ml</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-blue-50 rounded-full h-4 mb-8">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="flex justify-center gap-6">
          <button onClick={() => addWater(250)} className="p-4 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-all">
            <GlassWater className="text-blue-600 mb-1 mx-auto" />
            <span className="text-xs font-bold text-blue-700">+250ml</span>
          </button>
          <button onClick={() => addWater(500)} className="p-4 bg-blue-600 rounded-2xl hover:bg-blue-700 transition-all shadow-lg text-white">
            <Plus className="mb-1 mx-auto" />
            <span className="text-xs font-bold">+500ml</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;