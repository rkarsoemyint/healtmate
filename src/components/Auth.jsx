// src/components/Auth.jsx ပြင်ဆင်ရန်
import { useState } from 'react';
import { loginUser, registerUser, loginWithGoogle } from '../services/authService';
import { Activity } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm Password အတွက် state
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Register လုပ်ချိန်မှာ Password နှစ်ခု တူ၊ မတူ စစ်ဆေးခြင်း
    if (!isLogin && password !== confirmPassword) {
      setError("လျှို့ဝှက်နံပါတ် နှစ်ခု မကိုက်ညီပါ!");
      return;
    }

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase:', ''));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* Header အပိုင်း */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-xl text-white">
              <Activity size={32} />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'HealthMate သို့ ပြန်လာပါ' : 'အကောင့်အသစ်ဖွင့်ပါ'}
          </h2>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 italic">
              ⚠️ {error}
            </div>
          )}
          
          <input
            type="email"
            required
            className="rounded-lg w-full px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="အီးမေးလ်လိပ်စာ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <input
            type="password"
            required
            className="rounded-lg w-full px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="လျှို့ဝှက်နံပါတ်"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Register လုပ်နေချိန်မှသာ Confirm Password ကွင်းကို ပြမည် */}
          {!isLogin && (
            <input
              type="password"
              required
              className="rounded-lg w-full px-3 py-3 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 animate-fade-in"
              placeholder="လျှို့ဝှက်နံပါတ်ကို ထပ်မံရိုက်ထည့်ပါ"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold transition-all shadow-md"
          >
            {isLogin ? 'Login ဝင်မည်' : 'အကောင့်ဖွင့်မည်'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ဒါမှမဟုတ်</span></div>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google ဖြင့်ဝင်မည်
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(''); // Switch လုပ်ရင် error ကို ရှင်းပစ်မယ်
            }}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 underline decoration-dotted"
          >
            {isLogin ? 'အကောင့်မရှိသေးဘူးလား? အခုပဲဖွင့်လိုက်ပါ' : 'အကောင့်ရှိပြီးသားလား? Login ဝင်ပါ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;