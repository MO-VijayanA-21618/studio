import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './client';

export const resetAccountingSystem = async () => {
  try {
    // Delete all accounts
    const accountsSnapshot = await getDocs(collection(db, 'accounts'));
    const accountDeletePromises = accountsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(accountDeletePromises);

    // Delete all vouchers
    const vouchersSnapshot = await getDocs(collection(db, 'vouchers'));
    const voucherDeletePromises = vouchersSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(voucherDeletePromises);

    console.log('Accounting system reset successfully');
  } catch (error) {
    console.error('Error resetting accounting system:', error);
    throw error;
  }
};