import { auth } from "../firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// အကောင့်အသစ်ဖွင့်ရန်
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Email နဲ့ Login ဝင်ရန်
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google နဲ့ Login ဝင်ရန်
export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Logout ထွက်ရန်
export const logoutUser = () => {
  return signOut(auth);
};