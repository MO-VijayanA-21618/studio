import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './client';

export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const signUp = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () => 
  signInWithPopup(auth, new GoogleAuthProvider());

export const logout = () => signOut(auth);