import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './client';
import { UserData, defaultPermissions } from '../types/user';

export const createUser = async (userId: string, userData: Omit<UserData, 'id'>) => {
  if (!db) throw new Error('Firestore not initialized');
  const userDoc = doc(db, 'users', userId);
  await setDoc(userDoc, {
    ...userData,
    permissions: userData.permissions || defaultPermissions[userData.role],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getUser = async (userId: string) => {
  if (!db) throw new Error('Firestore not initialized');
  const userDoc = doc(db, 'users', userId);
  const snapshot = await getDoc(userDoc);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as UserData : null;
};

export const getAllUsers = async () => {
  if (!db) throw new Error('Firestore not initialized');
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  if (!db) throw new Error('Firestore not initialized');
  const userDoc = doc(db, 'users', userId);
  await updateDoc(userDoc, { ...updates, updatedAt: new Date() });
};

export const deleteUser = async (userId: string) => {
  if (!db) throw new Error('Firestore not initialized');
  const userDoc = doc(db, 'users', userId);
  await deleteDoc(userDoc);
};

export const getUserByEmail = async (email: string) => {
  if (!db) throw new Error('Firestore not initialized');
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserData;
};
