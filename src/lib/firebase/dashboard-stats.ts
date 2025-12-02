import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './client';

export const getDashboardStats = async () => {
  try {
    // Get all loans
    const loansSnapshot = await getDocs(collection(db, 'loans'));
    const loans = loansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate stats
    const totalLoans = loans.length;
    const activeLoans = loans.filter(loan => loan.status === 'Active').length;
    const renewalsPending = loans.filter(loan => {
      // Loans older than 30 days are considered for renewal
      const loanDate = loan.loanDate?.toDate() || new Date(loan.loanDate);
      const daysDiff = (new Date().getTime() - loanDate.getTime()) / (1000 * 3600 * 24);
      return loan.status === 'Active' && daysDiff > 30;
    }).length;
    
    const auctionAlerts = loans.filter(loan => {
      // Loans older than 90 days are auction alerts
      const loanDate = loan.loanDate?.toDate() || new Date(loan.loanDate);
      const daysDiff = (new Date().getTime() - loanDate.getTime()) / (1000 * 3600 * 24);
      return loan.status === 'Active' && daysDiff > 90;
    }).length;

    // Get recent loans (last 10)
    const recentLoans = loans
      .sort((a, b) => {
        const dateA = a.loanDate?.toDate() || new Date(a.loanDate);
        const dateB = b.loanDate?.toDate() || new Date(b.loanDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);

    return {
      totalLoans,
      activeLoans,
      renewalsPending,
      auctionAlerts,
      recentLoans
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalLoans: 0,
      activeLoans: 0,
      renewalsPending: 0,
      auctionAlerts: 0,
      recentLoans: []
    };
  }
};