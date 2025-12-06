import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  runTransaction,
  Timestamp 
} from 'firebase/firestore';
import { db } from './client';
import { Account, VoucherEntry, JournalEntry } from '@/lib/types/accounting';

// Initialize Chart of Accounts
export const initializeChartOfAccounts = async () => {
  if (!db) throw new Error('Firestore not initialized');
  const accounts: Omit<Account, 'id' | 'createdAt'>[] = [
    { code: '1001', name: 'Cash in Hand', type: 'ASSET', subType: 'CASH', balance: 0, isActive: true },
    { code: '1201', name: 'Loans Receivable', type: 'ASSET', subType: 'LOANS_RECEIVABLE', balance: 0, isActive: true },
    { code: '1301', name: 'Suspense Account', type: 'ASSET', subType: 'SUSPENSE', balance: 0, isActive: true },
    { code: '4001', name: 'Interest Income', type: 'INCOME', subType: 'INTEREST_INCOME', balance: 0, isActive: true },
    { code: '5001', name: 'Bad Debt Writeoff', type: 'EXPENSE', subType: 'WRITEOFF', balance: 0, isActive: true },
    { code: '3001', name: 'Owner Capital', type: 'EQUITY', subType: 'CAPITAL', balance: 0, isActive: true },
  ];

  const batch = writeBatch(db);
  accounts.forEach(account => {
    const docRef = doc(collection(db, 'accounts'));
    batch.set(docRef, { ...account, createdAt: Timestamp.now() });
  });
  
  await batch.commit();
};

// Create voucher entry with journal entries
export const createVoucherEntry = async (voucher: Omit<VoucherEntry, 'id' | 'createdAt'>) => {
  if (!db) throw new Error('Firestore not initialized');
  return await runTransaction(db, async (transaction) => {
    // First, read all account documents
    const accountRefs = voucher.entries.map(entry => doc(db, 'accounts', entry.accountId));
    const accountDocs = await Promise.all(accountRefs.map(ref => transaction.get(ref)));

    // Create voucher
    const voucherRef = doc(collection(db, 'vouchers'));
    transaction.set(voucherRef, {
      ...voucher,
      createdAt: Timestamp.now()
    });

    // Update account balances
    voucher.entries.forEach((entry, index) => {
      const accountDoc = accountDocs[index];
      if (accountDoc.exists()) {
        const currentBalance = accountDoc.data().balance || 0;
        const newBalance = currentBalance + entry.debit - entry.credit;
        transaction.update(accountRefs[index], { balance: newBalance });
      }
    });

    return voucherRef.id;
  });
};

// Get trial balance
export const getTrialBalance = async (asOfDate?: Date) => {
  if (!db) throw new Error('Firestore not initialized');
  const accountsQuery = query(
    collection(db, 'accounts'),
    where('isActive', '==', true)
  );
  
  const snapshot = await getDocs(accountsQuery);
  const accounts = snapshot.docs.map(doc => {
    const account = doc.data() as Account;
    return {
      accountId: doc.id,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.type,
      debitBalance: account.balance > 0 ? account.balance : 0,
      creditBalance: account.balance < 0 ? Math.abs(account.balance) : 0,
      netBalance: account.balance
    };
  });
  
  // Sort by code on client side
  return accounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
};

// Get vouchers for a date range
export const getVouchers = async (startDate: Date, endDate: Date) => {
  if (!db) throw new Error('Firestore not initialized');
  const vouchersQuery = query(
    collection(db, 'vouchers'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate))
  );
  
  const snapshot = await getDocs(vouchersQuery);
  const vouchers = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as VoucherEntry[];
  
  // Sort by date on client side
  return vouchers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};