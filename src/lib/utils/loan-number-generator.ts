import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export const generateLoanNumber = async (): Promise<string> => {
  try {
    // Get the latest loan to determine next number
    const loansQuery = query(
      collection(db, 'loans'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(loansQuery);
    
    if (snapshot.empty) {
      return 'LN001'; // First loan
    }
    
    const lastLoan = snapshot.docs[0].data();
    const lastLoanNumber = lastLoan.loanNumber || 'LN000';
    
    // Extract number and increment
    const numberPart = parseInt(lastLoanNumber.replace('LN', '')) || 0;
    const nextNumber = numberPart + 1;
    
    // Format with leading zeros
    return `LN${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating loan number:', error);
    // Fallback to timestamp-based number
    return `LN${Date.now().toString().slice(-3)}`;
  }
};