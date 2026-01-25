import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const validateLoanNumber = async (loanNumber: string, excludeId?: string): Promise<boolean> => {
  if (!loanNumber.trim()) return false;
  
  try {
    // Check in loans collection
    const loansQuery = query(
      collection(db, 'loans'),
      where('loanId', '==', loanNumber)
    );
    const loansSnapshot = await getDocs(loansQuery);
    
    // Check in receipts collection
    const receiptsQuery = query(
      collection(db, 'receipts'),
      where('receiptNumber', '==', loanNumber)
    );
    const receiptsSnapshot = await getDocs(receiptsQuery);
    
    // If editing, exclude current loan from validation
    if (excludeId) {
      const existingLoans = loansSnapshot.docs.filter(doc => doc.id !== excludeId);
      return existingLoans.length === 0 && receiptsSnapshot.docs.length === 0;
    }
    
    return loansSnapshot.docs.length === 0 && receiptsSnapshot.docs.length === 0;
  } catch (error) {
    console.error('Error validating loan number:', error);
    return false;
  }
};