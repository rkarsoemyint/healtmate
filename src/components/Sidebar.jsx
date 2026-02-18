import { useState } from 'react';
import { LayoutDashboard, Utensils, Activity, User, LogOut, Droplets, Menu, X, Zap } from 'lucide-react';
import { logoutUser } from '../services/authService';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'meals', name: 'Meal Tracker', icon: <Utensils size={20} /> },
    { id: 'health', name: 'Health Metrics', icon: <Activity size={20} /> },
    { id: 'water', name: 'Water Tracker', icon: <Droplets size={20} /> },
    { id: 'nutrition', name: 'Nutrition Guide', icon: <Zap size={20} /> }, 
    { id: 'profile', name: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* Mobile Header - ဖုန်းမှာပဲ ပေါ်မယ် */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-[60] shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <Activity /> HealthMate
        </h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 focus:outline-none">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-[55] w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-screen
      `}>
        {/* Desktop Logo - ဖုန်းမှာဆိုရင် Header ရှိလို့ ဒါကို ဖျောက်ထားမယ် */}
        <div className="p-6 hidden lg:block">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Activity /> HealthMate
          </h1>
        </div>
        
        {/* Menu List - ဖုန်းမှာ Header နဲ့ မငြိအောင် paddingTop (pt-20) ထည့်ထားပါတယ် */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 lg:pt-2 pt-20">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className={activeTab === item.id ? 'text-white' : 'text-blue-500'}>
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button onClick={() => logoutUser()} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold text-sm">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;