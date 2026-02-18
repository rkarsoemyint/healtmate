import { db, auth } from "../firebase"; // auth ကိုပါ import လုပ်ထားရပါမယ်
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from "firebase/firestore";

/**
 * BMI နှင့် ကျန်းမာရေးဒေတာများကို Firestore ထဲသို့ သိမ်းဆည်းရန်
 */
export const saveHealthData = async (healthData) => {
  const user = auth.currentUser; // လက်ရှိ Login ဝင်ထားသူကို စစ်ဆေးမည်

  if (!user) {
    return { success: false, error: "အသုံးပြုသူ Login ဝင်ထားရန် လိုအပ်ပါသည်။" };
  }

  try {
    const docRef = await addDoc(collection(db, "health_logs"), {
      userId: user.uid, // Login ဝင်ထားသူ၏ ID ကိုသာ သုံးမည်
      height: Number(healthData.height),
      weight: Number(healthData.weight),
      bmi: Number(healthData.bmi),
      status: healthData.status,
      createdAt: serverTimestamp(),
    });
    
    console.log("Data saved successfully with ID: ", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error saving health data: ", e);
    return { success: false, error: e.message };
  }
};

/**
 * အသုံးပြုသူ၏ ယခင်မှတ်တမ်းများကို ပြန်လည်ထုတ်ယူရန်
 */
export const getHealthHistory = async () => {
  const user = auth.currentUser;

  if (!user) return [];

  try {
    const q = query(
      collection(db, "health_logs"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Error fetching history: ", e);
    return [];
  }
};