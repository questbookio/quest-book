import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBg-pehLqb8937twNAStnjN0aNd9RJpLwk",
  authDomain: "quest-book-cf470.firebaseapp.com",
  projectId: "quest-book-cf470",
  storageBucket: "quest-book-cf470.firebasestorage.app",
  messagingSenderId: "522950958375",
  appId: "1:522950958375:web:0af1ada0b19bd7aeaf9d02"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;