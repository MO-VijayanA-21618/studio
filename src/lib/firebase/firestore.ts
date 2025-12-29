import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './client';
import { Customer, Loan, LoanItem } from '@/lib/types';
import { generateCustomerId, generateLoanId } from '@/lib/utils/id-generator';

export const COLLECTIONS = {
  CUSTOMERS: 'customers',
  LOANS: 'loans',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings'
};

export const createCustomer = async (customer: Omit<Customer, 'id' | 'customerId'>) => {
  if (!db) throw new Error('Firestore not initialized');
  const customerId = await generateCustomerId();
  return addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
    ...customer,
    customerId
  });
};

export const getCustomers = () => {
  if (!db) throw new Error('Firestore not initialized');
  return getDocs(collection(db, COLLECTIONS.CUSTOMERS));
};

export const getCustomer = (id: string) => {
  if (!db) throw new Error('Firestore not initialized');
  return getDoc(doc(db, COLLECTIONS.CUSTOMERS, id));
};

export const createLoan = async (loan: Omit<Loan, 'id' | 'loanId'>) => {
  if (!db) throw new Error('Firestore not initialized');
  const loanId = await generateLoanId();
  return addDoc(collection(db, COLLECTIONS.LOANS), {
    ...loan,
    loanId,
    loanDate: Timestamp.fromDate(loan.loanDate),
    createdAt: Timestamp.now()
  });
};

export const getLoans = () => {
  if (!db) throw new Error('Firestore not initialized');
  return getDocs(query(collection(db, COLLECTIONS.LOANS), orderBy('createdAt', 'desc')));
};

export const getLoansByStatus = (status: string) => {
  if (!db) throw new Error('Firestore not initialized');
  return getDocs(query(collection(db, COLLECTIONS.LOANS), where('status', '==', status)));
};

export const updateLoanStatus = (id: string, status: string) => {
  if (!db) throw new Error('Firestore not initialized');
  return updateDoc(doc(db, COLLECTIONS.LOANS, id), { status });
};

export const createTransaction = (transaction: {
  loanId: string;
  type: 'repayment' | 'renewal' | 'closure' | 'auction';
  amount: number;
  date: Date;
}) => {
  if (!db) throw new Error('Firestore not initialized');
  return addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.now()
  });
};