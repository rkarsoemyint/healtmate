import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { User, Mail, Save, Edit2, Ruler, Weight, Link as LinkIcon } from 'lucide-react';

const Profile = () => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHeight(data.height || '');
          setWeight(data.weight || '');
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdate = async () => {
    try {
      // ပုံ Link မရှိရင် နာမည်နဲ့ Avatar ထုတ်ပေးမယ့် API ကို သုံးထားပါတယ်
      const finalPhoto = photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=0D8ABC&color=fff&size=128`;

      await updateProfile(auth.currentUser, { 
        displayName, 
        photoURL: finalPhoto 
      });

      await setDoc(doc(db, 'users', user.uid), {
        height: Number(height),
        weight: Number(weight),
      }, { merge: true });

      setIsEditing(false);
      setMessage('အချက်အလက်များ ပြင်ဆင်ပြီးပါပြီ။');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col items-center -mt-16">
            {/* Profile Image Display */}
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
              {photoURL ? (
                <img src={photoURL} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-200 bg-blue-50">
                   <User size={50} />
                </div>
              )}
            </div>

            <div className="mt-6 w-full space-y-4">
              {message && <p className="text-center text-sm font-bold text-green-600">{message}</p>}
              
              <div className="space-y-4">
                {/* Display Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    disabled={!isEditing}
                    className={`w-full px-5 py-3 rounded-2xl border transition-all ${isEditing ? 'border-blue-400 bg-white ring-2 ring-blue-50' : 'bg-gray-50 border-transparent text-gray-700'}`}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>

                {/* Photo URL Input - Edit လုပ်မှ ပေါ်လာမယ် */}
                {isEditing && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <LinkIcon size={12} /> Photo URL (Optional)
                    </label>
                    <input 
                      className="w-full px-5 py-3 rounded-2xl border border-blue-400 bg-white"
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Ruler size={12}/> Height (cm)</label>
                    <input type="number" disabled={!isEditing} value={height} onChange={(e) => setHeight(e.target.value)} className={`w-full px-5 py-3 rounded-2xl border transition-all ${isEditing ? 'border-blue-400' : 'bg-gray-50 border-transparent'}`} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Weight size={12}/> Weight (kg)</label>
                    <input type="number" disabled={!isEditing} value={weight} onChange={(e) => setWeight(e.target.value)} className={`w-full px-5 py-3 rounded-2xl border transition-all ${isEditing ? 'border-blue-400' : 'bg-gray-50 border-transparent'}`} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                    <Edit2 size={18} /> Profile ပြင်ဆင်မည်
                  </button>
                ) : (
                  <button onClick={handleUpdate} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                    <Save size={18} /> သိမ်းဆည်းမည်
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;