// Import the functions you need from the SDKs you need
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app, 'goldfin');

export { app, auth, db };
