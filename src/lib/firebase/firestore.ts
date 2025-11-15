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

// Collections
export const COLLECTIONS = {
  CUSTOMERS: 'customers',
  LOANS: 'loans',
  TRANSACTIONS: 'transactions',
  SETTINGS: 'settings'
};

// Customer operations
export const createCustomer = (customer: Omit<Customer, 'id'>) => 
  addDoc(collection(db, COLLECTIONS.CUSTOMERS), customer);

export const getCustomers = () => 
  getDocs(collection(db, COLLECTIONS.CUSTOMERS));

export const getCustomer = (id: string) => 
  getDoc(doc(db, COLLECTIONS.CUSTOMERS, id));

// Loan operations
export const createLoan = (loan: Omit<Loan, 'id'>) => 
  addDoc(collection(db, COLLECTIONS.LOANS), {
    ...loan,
    loanDate: Timestamp.fromDate(loan.loanDate),
    createdAt: Timestamp.now()
  });

export const getLoans = () => 
  getDocs(query(collection(db, COLLECTIONS.LOANS), orderBy('createdAt', 'desc')));

export const getLoansByStatus = (status: string) => 
  getDocs(query(collection(db, COLLECTIONS.LOANS), where('status', '==', status)));

export const updateLoanStatus = (id: string, status: string) => 
  updateDoc(doc(db, COLLECTIONS.LOANS, id), { status });

// Transaction operations
export const createTransaction = (transaction: {
  loanId: string;
  type: 'repayment' | 'renewal' | 'closure' | 'auction';
  amount: number;
  date: Date;
}) => 
  addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
    ...transaction,
    date: Timestamp.fromDate(transaction.date),
    createdAt: Timestamp.now()
  });