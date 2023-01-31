// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-9Xkga1dR0oOhMGGf75PkfDgdoW69XvU",
  authDomain: "narsingdi-biggan-club.firebaseapp.com",
  projectId: "narsingdi-biggan-club",
  storageBucket: "narsingdi-biggan-club.appspot.com",
  messagingSenderId: "610986991080",
  appId: "1:610986991080:web:05b9ee095cc0091069585d",
  measurementId: "G-4NNK2SWQYP"
};

// Initialize Firebase
const app = !getApps().length > 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage();

export { app, db, storage };