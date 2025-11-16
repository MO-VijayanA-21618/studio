// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBBI2BTZvKISViApC04V_RCxuGaLf9Q6E",
  authDomain: "finapp-1fe29.firebaseapp.com",
  projectId: "finapp-1fe29",
  storageBucket: "finapp-1fe29.appspot.com",
  messagingSenderId: "373559123522",
  appId: "1:373559123522:web:c8618bb93d1e164a08d7db",
  measurementId: "G-24Y4SF5E4J"
};


// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app, 'goldfin');

export { app, auth, db };