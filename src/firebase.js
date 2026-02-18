import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAHVkinGhak4HOnAfi4I2_ngLrl7O3J3tE",
  authDomain: "healthmate-364dc.firebaseapp.com",
  projectId: "healthmate-364dc",
  storageBucket: "healthmate-364dc.firebasestorage.app",
  messagingSenderId: "578640063594",
  appId: "1:578640063594:web:57f0e0d1c0ff7af1dcae13"
};

// Firebase ကို Initialize လုပ်ခြင်း
const app = initializeApp(firebaseConfig);

// တခြားဖိုင်တွေကနေ လှမ်းသုံးလို့ရအောင် Export လုပ်ခြင်း
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;