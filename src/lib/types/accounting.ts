export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  subType: 'CASH' | 'LOANS_RECEIVABLE' | 'INTEREST_INCOME' | 'SUSPENSE' | 'WRITEOFF' | 'CAPITAL';
  balance: number;
  isActive: boolean;
  createdAt: Date;
}

export interface VoucherEntry {
  id: string;
  voucherNumber: string;
  date: Date;
  type: 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'INTEREST_COLLECTION' | 'WRITEOFF' | 'ADJUSTMENT';
  description: string;
  reference?: string; // loan ID or other reference
  entries: JournalEntry[];
  totalAmount: number;
  createdBy: string;
  createdAt: Date;
}

export interface JournalEntry {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export interface TrialBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitBalance: number;
  creditBalance: number;
  netBalance: number;
}

export interface DayBook {
  date: string;
  openingCash: number;
  totalReceipts: number;
  totalPayments: number;
  closingCash: number;
  entries: VoucherEntry[];
}