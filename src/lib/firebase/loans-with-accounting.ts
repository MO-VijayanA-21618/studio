import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from './client';
import { Loan } from '@/lib/types';
import { createLoanDisbursementVoucher, createLoanRepaymentVoucher } from '@/lib/accounting/voucher-generator';
import { generateLoanId } from '@/lib/utils/id-generator';

// Create loan with accounting entry
export const createLoanWithAccounting = async (
  loanData: Omit<Loan, 'id'> & { loanId?: string },
  userId: string
) => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    // Use provided loanId or generate new one
    const loanId = loanData.loanId || await generateLoanId();
    
    // Create loan record
    const loanRef = await addDoc(collection(db, 'loans'), {
      ...loanData,
      loanId,
      loanDate: Timestamp.fromDate(loanData.loanDate),
      createdAt: Timestamp.now(),
    });

    // Create accounting voucher for loan disbursement
    await createLoanDisbursementVoucher(
      loanRef.id,
      loanData.loanAmount,
      loanData.customerName,
      userId
    );

    return loanRef.id;
  } catch (error) {
    console.error('Error creating loan with accounting:', error);
    throw error;
  }
};

// Process loan repayment with accounting entry
export const processLoanRepayment = async (
  loanId: string,
  principalAmount: number,
  interestAmount: number,
  customerName: string,
  userId: string
) => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    // Update loan status
    await updateDoc(doc(db, 'loans', loanId), {
      status: 'Closed',
      repaymentDate: Timestamp.now(),
      repaymentAmount: principalAmount + interestAmount,
    });

    // Create accounting voucher for repayment
    await createLoanRepaymentVoucher(
      loanId,
      principalAmount,
      interestAmount,
      customerName,
      userId
    );

    return true;
  } catch (error) {
    console.error('Error processing repayment with accounting:', error);
    throw error;
  }
};