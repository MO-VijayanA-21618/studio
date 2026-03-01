import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Migration script to fix old repayment transactions
 * Adds principalAmount and interestAmount fields to transactions that don't have them
 */
export const migrateRepaymentTransactions = async () => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    console.log('Starting transaction migration...');
    
    // Get all repayment transactions
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('type', '==', 'repayment')
    );
    
    const snapshot = await getDocs(transactionsQuery);
    console.log(`Found ${snapshot.docs.length} repayment transactions`);
    
    const transactionsToFix = [];
    
    // Find transactions missing principalAmount or interestAmount
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.principalAmount === undefined || data.interestAmount === undefined) {
        transactionsToFix.push({
          id: docSnap.id,
          data: data
        });
      }
    });
    
    console.log(`Found ${transactionsToFix.length} transactions to fix`);
    
    if (transactionsToFix.length === 0) {
      console.log('No transactions need fixing');
      return {
        success: true,
        message: 'No transactions need fixing',
        fixed: 0,
        total: snapshot.docs.length
      };
    }
    
    // Log transactions that will be fixed
    console.log('Transactions to fix:');
    transactionsToFix.forEach(t => {
      console.log(`- Transaction ${t.id}: amount=${t.data.amount}, loanId=${t.data.loanId}`);
    });
    
    // Update each transaction
    let fixed = 0;
    for (const transaction of transactionsToFix) {
      try {
        // Assume old transactions without breakdown are principal repayments
        await updateDoc(doc(db, 'transactions', transaction.id), {
          principalAmount: transaction.data.amount,
          interestAmount: 0,
          description: transaction.data.description || 'Principal repayment (migrated)'
        });
        fixed++;
        console.log(`✓ Fixed transaction ${transaction.id}`);
      } catch (error) {
        console.error(`✗ Failed to fix transaction ${transaction.id}:`, error);
      }
    }
    
    console.log(`Migration complete: ${fixed}/${transactionsToFix.length} transactions fixed`);
    
    return {
      success: true,
      message: `Successfully migrated ${fixed} transactions`,
      fixed,
      total: snapshot.docs.length,
      needsFix: transactionsToFix.length
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: error.message,
      fixed: 0
    };
  }
};

/**
 * Preview transactions that need migration without updating them
 */
export const previewTransactionMigration = async () => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('type', '==', 'repayment')
    );
    
    const snapshot = await getDocs(transactionsQuery);
    
    const transactionsToFix = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.principalAmount === undefined || data.interestAmount === undefined) {
        // Fetch customer name from loan
        let customerName = 'Unknown';
        if (data.loanId) {
          try {
            const loanDoc = await getDocs(query(collection(db, 'loans'), where('__name__', '==', data.loanId)));
            if (!loanDoc.empty) {
              customerName = loanDoc.docs[0].data().customerName || 'Unknown';
            }
          } catch (error) {
            console.error('Error fetching customer name:', error);
          }
        }
        
        transactionsToFix.push({
          id: docSnap.id,
          loanId: data.loanId,
          amount: data.amount,
          date: data.date?.toDate?.() || data.date,
          description: data.description,
          customerName
        });
      }
    }
    
    return {
      total: snapshot.docs.length,
      needsFix: transactionsToFix.length,
      transactions: transactionsToFix
    };
    
  } catch (error) {
    console.error('Preview failed:', error);
    throw error;
  }
};