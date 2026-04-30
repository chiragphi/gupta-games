import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAIWGWL29hIEz0MOIX4lVcVj-404IYTbqY",
  authDomain: "gupta-65fb7.firebaseapp.com",
  databaseURL: "https://gupta-65fb7-default-rtdb.firebaseio.com",
  projectId: "gupta-65fb7",
  storageBucket: "gupta-65fb7.firebasestorage.app",
  messagingSenderId: "503407523031",
  appId: "1:503407523031:web:1e404cb994b03b08e42c92",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
