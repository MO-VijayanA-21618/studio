import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

// Generate loan ID in format: NL2024001, NL2024002, etc.
export const generateLoanId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `NL${currentYear}`;
  
  // Get the highest existing loan number for current year
  const loansQuery = query(
    collection(db, 'loans'),
    where('loanId', '>=', prefix),
    where('loanId', '<', `NL${currentYear + 1}`)
  );
  
  const snapshot = await getDocs(loansQuery);
  let maxNumber = 0;
  
  snapshot.docs.forEach(doc => {
    const loanId = doc.data().loanId;
    if (loanId && loanId.startsWith(prefix)) {
      const number = parseInt(loanId.substring(prefix.length));
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// Generate receipt number in format: RC2024001, RC2024002, etc.
export const generateReceiptNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `RC${currentYear}`;
  
  // Get the highest existing receipt number for current year
  const receiptsQuery = query(
    collection(db, 'receipts'),
    where('receiptNumber', '>=', prefix),
    where('receiptNumber', '<', `RC${currentYear + 1}`)
  );
  
  const snapshot = await getDocs(receiptsQuery);
  let maxNumber = 0;
  
  snapshot.docs.forEach(doc => {
    const receiptNumber = doc.data().receiptNumber;
    if (receiptNumber && receiptNumber.startsWith(prefix)) {
      const number = parseInt(receiptNumber.substring(prefix.length));
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// Generate customer ID in format: CU2024001, CU2024002, etc.
export const generateCustomerId = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const prefix = `CU${currentYear}`;
  
  // Get the highest existing customer number for current year
  const customersQuery = query(
    collection(db, 'customers'),
    where('customerId', '>=', prefix),
    where('customerId', '<', `CU${currentYear + 1}`)
  );
  
  const snapshot = await getDocs(customersQuery);
  let maxNumber = 0;
  
  snapshot.docs.forEach(doc => {
    const customerId = doc.data().customerId;
    if (customerId && customerId.startsWith(prefix)) {
      const number = parseInt(customerId.substring(prefix.length));
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  
  const nextNumber = maxNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// Reserve receipt number to prevent duplicate usage
export const reserveReceiptNumber = async (receiptNumber: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  await addDoc(collection(db, 'receipts'), {
    receiptNumber,
    reserved: true,
    createdAt: new Date()
  });
};