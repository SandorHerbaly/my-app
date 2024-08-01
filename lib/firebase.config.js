// lib/firebase.config.js
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);

// CORS beállítása
const invoicesRef = ref(storage, 'invoices');
listAll(invoicesRef).then(() => {
  console.log("CORS settings activated for 'invoices' folder");
}).catch((error) => {
  console.error("Error setting up CORS:", error);
});

export { storage, db };