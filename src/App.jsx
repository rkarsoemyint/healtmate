import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HealthMetrics from './components/HealthMetrics';
import Auth from './components/Auth';
import MealTracker from './components/MealTracker';
import Profile from './components/Profile';
import WaterTracker from './components/WaterTracker';
import NutritionGuide from './components/NutritionGuide'; // ဒါလေး ပါရပါမယ်

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-blue-600 animate-pulse">HealthMate...</div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar - activeTab နဲ့ setActiveTab ကို လက်ဆင့်ကမ်းပေးရမယ် */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 w-full overflow-x-hidden p-4 md:p-6 flex flex-col">
        <div className="max-w-7xl mx-auto flex-1 w-full">
          {/* Tab logic - အဖြူထည်မဖြစ်အောင် သေချာစစ်ဆေးခြင်း */}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'health' && <HealthMetrics />}
          {activeTab === 'meals' && <MealTracker />}
          {activeTab === 'water' && <WaterTracker />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'nutrition' && <NutritionGuide />}
        </div>

        {/* Developed by Than Zin Oo - Footer */}
        <footer className="mt-10 py-6 text-center border-t border-gray-200">
          <p className="text-sm text-gray-500 font-medium">
            Developed by <span className="text-blue-600 font-bold">Than Zin Oo</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
            HealthMate Version 1.0.5
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;