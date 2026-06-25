import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEVpXziuBFxnu6ZGhaLesnRXaJkjstrS4",
  authDomain: "2next.firebaseapp.com",
  projectId: "youtube2next",
  storageBucket: "youtube2next.firebasestorage.app",
  messagingSenderId: "601761784633",
  appId: "1:601761784633:web:7b66dff78b39b664213ee8"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = initializeFirestore(app, {}, "ai-studio-ef3a6523-66b0-4bc9-99c3-7ed20fcb9f8e");
export const auth = getAuth(app);

