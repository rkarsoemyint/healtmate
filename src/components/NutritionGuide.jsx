import { Apple, Beef, Fish, Sprout, Egg } from 'lucide-react';

const NutritionGuide = () => {
  const foodData = [
    {
      category: "Protein (ပရိုတင်း)",
      icon: <Beef className="text-red-500" />,
      description: "ကြွက်သား တည်ဆောက်ရန်နှင့် ခန္ဓာကိုယ် ဖွံ့ဖြိုးရန်။",
      foods: [
        { name: "ကြက်ရင်ပုံသား", nutrients: "Protein မြင့်မား၊ အဆီနည်း" },
        { name: "ဥအမျိုးမျိုး", nutrients: "Protein နှင့် Vitamin B12" },
        { name: "ပဲအမျိုးမျိုး", nutrients: "Plant-based Protein & Fiber" }
      ]
    },
    {
      category: "Omega-3 & Healthy Fats",
      icon: <Fish className="text-blue-500" />,
      description: "ဦးနှောက်နှင့် နှလုံးကျန်းမာရေးအတွက်။",
      foods: [
        { name: "ငါးအမျိုးမျိုး", nutrients: "Omega-3, Vitamin D" },
        { name: "ထောပတ်သီး", nutrients: "Good Fats & Potassium" },
        { name: "သစ်ကြားသီး", nutrients: "Healthy Fats & Antioxidants" }
      ]
    },
    {
      category: "Fiber (အမျှင်ဓာတ်)",
      icon: <Sprout className="text-green-500" />,
      description: "အစာခြေစနစ်နှင့် ဝမ်းမှန်စေရန်။",
      foods: [
        { name: "အစိမ်းရောင်ဟင်းသီးဟင်းရွက်", nutrients: "Iron, Vitamin C, Fiber" },
        { name: "ပန်းဂေါ်ဖီစိမ်း (Broccoli)", nutrients: "Vitamin K, Fiber" },
        { name: "အုတ်ဂျုံ (Oats)", nutrients: "Fiber, Energy" }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">အာဟာရ လမ်းညွှန် (Nutrition Guide) 🍎</h1>
        <p className="text-gray-500">ကျန်းမာရေးနှင့် ညီညွတ်သော အစားအစာများအကြောင်း လေ့လာပါ။</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodData.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-2xl">{item.icon}</div>
              <h2 className="font-bold text-lg text-gray-800">{item.category}</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4 italic">{item.description}</p>
            <div className="space-y-3">
              {item.foods.map((food, fIndex) => (
                <div key={fIndex} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold text-gray-700">{food.name}</p>
                  <p className="text-[10px] text-blue-500 font-medium uppercase">{food.nutrients}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionGuide;