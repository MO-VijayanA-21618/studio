import { VoucherEntry, JournalEntry } from '@/lib/types/accounting';
import { createVoucherEntry } from '@/lib/firebase/accounting';
import { getAccountIds } from '@/lib/firebase/setup-accounting';

// Generate voucher number
const generateVoucherNumber = (type: string, date: Date) => {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${type}-${year}${month}${day}-${random}`;
};

// Create loan disbursement voucher
export const createLoanDisbursementVoucher = async (
  loanId: string,
  amount: number,
  customerName: string,
  userId: string
) => {
  const accountIds = getAccountIds();
  
  const entries: JournalEntry[] = [
    {
      accountId: accountIds.LOANS_RECEIVABLE,
      accountCode: '1201',
      accountName: 'Loans Receivable',
      debit: amount,
      credit: 0,
      description: `Loan disbursed to ${customerName}`
    },
    {
      accountId: accountIds.CASH_IN_HAND,
      accountCode: '1001',
      accountName: 'Cash in Hand',
      debit: 0,
      credit: amount,
      description: `Cash paid to ${customerName}`
    }
  ];

  const voucher: Omit<VoucherEntry, 'id' | 'createdAt'> = {
    voucherNumber: generateVoucherNumber('LD', new Date()),
    date: new Date(),
    type: 'LOAN_DISBURSEMENT',
    description: `Loan disbursement - ${customerName}`,
    reference: loanId,
    entries,
    totalAmount: amount,
    createdBy: userId
  };

  return await createVoucherEntry(voucher);
};

// Create loan repayment voucher
export const createLoanRepaymentVoucher = async (
  loanId: string,
  principalAmount: number,
  interestAmount: number,
  customerName: string,
  userId: string
) => {
  const accountIds = getAccountIds();
  const totalAmount = principalAmount + interestAmount;
  
  const entries: JournalEntry[] = [
    {
      accountId: accountIds.CASH_IN_HAND,
      accountCode: '1001',
      accountName: 'Cash in Hand',
      debit: totalAmount,
      credit: 0,
      description: `Cash received from ${customerName}`
    },
    {
      accountId: accountIds.LOANS_RECEIVABLE,
      accountCode: '1201',
      accountName: 'Loans Receivable',
      debit: 0,
      credit: principalAmount,
      description: `Principal repayment - ${customerName}`
    }
  ];

  if (interestAmount > 0) {
    entries.push({
      accountId: accountIds.INTEREST_INCOME,
      accountCode: '4001',
      accountName: 'Interest Income',
      debit: 0,
      credit: interestAmount,
      description: `Interest received - ${customerName}`
    });
  }

  const voucher: Omit<VoucherEntry, 'id' | 'createdAt'> = {
    voucherNumber: generateVoucherNumber('LR', new Date()),
    date: new Date(),
    type: 'LOAN_REPAYMENT',
    description: `Loan repayment - ${customerName}`,
    reference: loanId,
    entries,
    totalAmount,
    createdBy: userId
  };

  return await createVoucherEntry(voucher);
};

// Create writeoff voucher
export const createWriteoffVoucher = async (
  loanId: string,
  amount: number,
  customerName: string,
  userId: string
) => {
  const accountIds = getAccountIds();
  
  const entries: JournalEntry[] = [
    {
      accountId: accountIds.WRITEOFF_EXPENSE,
      accountCode: '5001',
      accountName: 'Bad Debt Writeoff',
      debit: amount,
      credit: 0,
      description: `Loan writeoff - ${customerName}`
    },
    {
      accountId: accountIds.LOANS_RECEIVABLE,
      accountCode: '1201',
      accountName: 'Loans Receivable',
      debit: 0,
      credit: amount,
      description: `Loan written off - ${customerName}`
    }
  ];

  const voucher: Omit<VoucherEntry, 'id' | 'createdAt'> = {
    voucherNumber: generateVoucherNumber('WO', new Date()),
    date: new Date(),
    type: 'WRITEOFF',
    description: `Loan writeoff - ${customerName}`,
    reference: loanId,
    entries,
    totalAmount: amount,
    createdBy: userId
  };

  return await createVoucherEntry(voucher);
};