'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTrialBalance } from '@/lib/firebase/accounting';
import { TrialBalance as TrialBalanceType } from '@/lib/types/accounting';
import { useLanguage } from '@/contexts/LanguageContext';

export function TrialBalance() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadTrialBalance();
  }, []);

  const loadTrialBalance = async () => {
    try {
      const data = await getTrialBalance();
      setTrialBalance(data);
    } catch (error) {
      console.error('Error loading trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDebits = trialBalance.reduce((sum, account) => sum + account.debitBalance, 0);
  const totalCredits = trialBalance.reduce((sum, account) => sum + account.creditBalance, 0);

  if (loading) {
    return <div>Loading trial balance...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trialBalance.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell>{account.accountCode}</TableCell>
                <TableCell>{account.accountName}</TableCell>
                <TableCell className="text-right">
                  {account.debitBalance > 0 ? `₹${account.debitBalance.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {account.creditBalance > 0 ? `₹${account.creditBalance.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold border-t-2">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">₹{totalDebits.toLocaleString()}</TableCell>
              <TableCell className="text-right">₹{totalCredits.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}