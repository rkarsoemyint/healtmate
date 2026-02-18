import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Calculator, History, TrendingUp } from 'lucide-react';

const HealthMetrics = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);

  // ၁။ သိမ်းထားသော မှတ်တမ်းများကို Real-time ပြန်ဆွဲထုတ်ခြင်း
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'health_logs'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    });

    return () => unsubscribe();
  }, []);

  const calculateBMI = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Please login first");

    const hInMeters = height / 100;
    const bmiValue = (weight / (hInMeters * hInMeters)).toFixed(1);
    
    let bmiStatus = '';
    if (bmiValue < 18.5) bmiStatus = 'Underweight';
    else if (bmiValue < 25) bmiStatus = 'Normal';
    else if (bmiValue < 30) bmiStatus = 'Overweight';
    else bmiStatus = 'Obese';

    setBmi(bmiValue);
    setStatus(bmiStatus);

    // ၂။ Database ထဲသို့ userId ပါဝင်အောင် သိမ်းဆည်းခြင်း
    try {
      await addDoc(collection(db, 'health_logs'), {
        userId: user.uid, // ဒါက အရေးကြီးဆုံးပါ
        height: Number(height),
        weight: Number(weight),
        bmi: Number(bmiValue),
        status: bmiStatus,
        createdAt: new Date()
      });
      setHeight('');
      setWeight('');
    } catch (error) {
      console.error("Error saving BMI:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calculator className="text-blue-600" /> BMI Calculator
        </h2>
        <form onSubmit={calculateBMI} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Height (cm)</label>
            <input required type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500" placeholder="170" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase ml-1">Weight (kg)</label>
            <input required type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500" placeholder="65" />
          </div>
          <button type="submit" className="bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Calculate & Save
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><History className="text-blue-600" /> ကျန်းမာရေးမှတ်တမ်းများ</h2>
          <TrendingUp size={20} className="text-gray-300" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4">ရက်စွဲ</th>
                <th className="px-8 py-4">BMI</th>
                <th className="px-8 py-4">အခြေအနေ</th>
                <th className="px-8 py-4">ကိုယ်အလေးချိန်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {history.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4 text-sm text-gray-500">
                    {log.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-8 py-4 font-bold text-gray-800">{log.bmi}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${log.status === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-sm font-medium text-gray-600">{log.weight} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;