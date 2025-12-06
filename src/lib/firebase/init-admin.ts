import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './client';
import { defaultPermissions } from '../types/user';

export const initAdminUser = async (userId: string, email: string) => {
  const userDoc = doc(db, 'users', userId);
  const snapshot = await getDoc(userDoc);
  
  if (!snapshot.exists() && email === 'admin@gmail.com') {
    await setDoc(userDoc, {
      email,
      name: 'Admin',
      role: 'admin',
      permissions: defaultPermissions.admin,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};
