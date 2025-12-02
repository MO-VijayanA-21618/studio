'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTrialBalance, getVouchers } from '@/lib/firebase/accounting';
import { TrialBalance } from '@/lib/types/accounting';
import { format, startOfDay, endOfDay } from 'date-fns';

export function AccountingSummary() {
  const [cashBalance, setCashBalance] = useState(0);
  const [loansReceivable, setLoansReceivable] = useState(0);
  const [todayReceipts, setTodayReceipts] = useState(0);
  const [todayPayments, setTodayPayments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountingSummary();
  }, []);

  const loadAccountingSummary = async () => {
    try {
      // Get trial balance for account balances
      const trialBalance = await getTrialBalance();
      
      const cashAccount = trialBalance.find(acc => acc.accountCode === '1001');
      const loansAccount = trialBalance.find(acc => acc.accountCode === '1201');
      
      setCashBalance(cashAccount?.netBalance || 0);
      setLoansReceivable(loansAccount?.netBalance || 0);

      // Get today's transactions
      const today = new Date();
      const todayVouchers = await getVouchers(startOfDay(today), endOfDay(today));
      
      const receipts = todayVouchers
        .filter(v => v.type === 'LOAN_REPAYMENT')
        .reduce((sum, v) => sum + v.totalAmount, 0);
      
      const payments = todayVouchers
        .filter(v => v.type === 'LOAN_DISBURSEMENT')
        .reduce((sum, v) => sum + v.totalAmount, 0);
      
      setTodayReceipts(receipts);
      setTodayPayments(payments);
    } catch (error) {
      console.error('Error loading accounting summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading accounting summary...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Cash in Hand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{cashBalance.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Loans Outstanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{loansReceivable.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">₹{todayReceipts.toLocaleString()}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today's Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">₹{todayPayments.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  );
}