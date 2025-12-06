import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './client';
import { UserData, defaultPermissions } from '../types/user';

const usersCollection = collection(db, 'users');

export const createUser = async (userId: string, userData: Omit<UserData, 'id'>) => {
  const userDoc = doc(usersCollection, userId);
  await setDoc(userDoc, {
    ...userData,
    permissions: userData.permissions || defaultPermissions[userData.role],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const getUser = async (userId: string) => {
  const userDoc = doc(usersCollection, userId);
  const snapshot = await getDoc(userDoc);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as UserData : null;
};

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  const userDoc = doc(usersCollection, userId);
  await updateDoc(userDoc, { ...updates, updatedAt: new Date() });
};

export const deleteUser = async (userId: string) => {
  const userDoc = doc(usersCollection, userId);
  await deleteDoc(userDoc);
};

export const getUserByEmail = async (email: string) => {
  const q = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserData;
};
