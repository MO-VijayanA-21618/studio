import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './client';

// Initialize chart of accounts in Firebase
export const setupChartOfAccounts = async (initialCapital: number = 0) => {
  const accounts = [
    { id: 'cash_in_hand', code: '1001', name: 'Cash in Hand', type: 'ASSET', subType: 'CASH', balance: initialCapital, isActive: true },
    { id: 'loans_receivable', code: '1201', name: 'Loans Receivable', type: 'ASSET', subType: 'LOANS_RECEIVABLE', balance: 0, isActive: true },
    { id: 'suspense_account', code: '1301', name: 'Suspense Account', type: 'ASSET', subType: 'SUSPENSE', balance: 0, isActive: true },
    { id: 'interest_income', code: '4001', name: 'Interest Income', type: 'INCOME', subType: 'INTEREST_INCOME', balance: 0, isActive: true },
    { id: 'writeoff_expense', code: '5001', name: 'Bad Debt Writeoff', type: 'EXPENSE', subType: 'WRITEOFF', balance: 0, isActive: true },
    { id: 'owner_capital', code: '3001', name: 'Owner Capital', type: 'EQUITY', subType: 'CAPITAL', balance: initialCapital, isActive: true },
  ];

  // Check if accounts already exist
  const existingAccounts = await getDocs(query(collection(db, 'accounts')));
  if (existingAccounts.size > 0) {
    console.log('Chart of accounts already exists');
    throw new Error('Accounts already exist. Delete existing accounts first to reinitialize.');
  }

  // Create accounts with fixed IDs
  for (const account of accounts) {
    await setDoc(doc(db, 'accounts', account.id), {
      code: account.code,
      name: account.name,
      type: account.type,
      subType: account.subType,
      balance: account.balance,
      isActive: account.isActive,
      createdAt: new Date()
    });
  }

  console.log('Chart of accounts created successfully');
};

// Get account IDs for voucher creation
export const getAccountIds = () => ({
  CASH_IN_HAND: 'cash_in_hand',
  LOANS_RECEIVABLE: 'loans_receivable',
  SUSPENSE_ACCOUNT: 'suspense_account',
  INTEREST_INCOME: 'interest_income',
  WRITEOFF_EXPENSE: 'writeoff_expense',
  OWNER_CAPITAL: 'owner_capital'
});