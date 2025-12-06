'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { createVoucherEntry } from '@/lib/firebase/accounting';
import { getAccountIds } from '@/lib/firebase/setup-accounting';
import { useToast } from '@/hooks/use-toast';

export function QuickEntryTemplates() {
  const [amounts, setAmounts] = useState({
    cashDeposit: 0,
    expense: 0,
    withdrawal: 0
  });
  const [loading, setLoading] = useState('');
  const { toast } = useToast();

  const createQuickEntry = async (type: string, amount: number, description: string) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(type);
    try {
      const { auth } = await import('@/lib/firebase/client');
      if (!auth.currentUser) throw new Error('User not authenticated');

      const accountIds = getAccountIds();
      let entries = [];

      switch (type) {
        case 'cashDeposit':
          entries = [
            {
              accountId: accountIds.CASH_IN_HAND,
              accountCode: '1001',
              accountName: 'Cash in Hand',
              debit: amount,
              credit: 0,
              description: 'Cash deposited to business'
            },
            {
              accountId: accountIds.OWNER_CAPITAL,
              accountCode: '3001',
              accountName: 'Owner Capital',
              debit: 0,
              credit: amount,
              description: 'Owner capital contribution'
            }
          ];
          break;

        case 'expense':
          entries = [
            {
              accountId: accountIds.SUSPENSE_ACCOUNT,
              accountCode: '1301',
              accountName: 'Suspense Account',
              debit: amount,
              credit: 0,
              description: description
            },
            {
              accountId: accountIds.CASH_IN_HAND,
              accountCode: '1001',
              accountName: 'Cash in Hand',
              debit: 0,
              credit: amount,
              description: 'Cash paid for expense'
            }
          ];
          break;

        case 'withdrawal':
          entries = [
            {
              accountId: accountIds.OWNER_CAPITAL,
              accountCode: '3001',
              accountName: 'Owner Capital',
              debit: amount,
              credit: 0,
              description: 'Owner withdrawal'
            },
            {
              accountId: accountIds.CASH_IN_HAND,
              accountCode: '1001',
              accountName: 'Cash in Hand',
              debit: 0,
              credit: amount,
              description: 'Cash withdrawn by owner'
            }
          ];
          break;
      }

      const voucher = {
        voucherNumber: `QE-${type.toUpperCase()}-${Date.now()}`,
        date: new Date(),
        type: 'ADJUSTMENT' as const,
        description,
        entries,
        totalAmount: amount,
        createdBy: auth.currentUser.uid
      };

      await createVoucherEntry(voucher);

      toast({
        title: "Entry Created",
        description: `${description} - ₹${amount.toLocaleString()}`,
      });

      // Reset amount
      setAmounts(prev => ({ ...prev, [type]: 0 }));
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create entry",
        variant: "destructive",
      });
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cash Deposit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amounts.cashDeposit || ''}
              onChange={(e) => setAmounts(prev => ({ ...prev, cashDeposit: Number(e.target.value) }))}
            />
          </div>
          <Button
            onClick={() => createQuickEntry('cashDeposit', amounts.cashDeposit, 'Cash deposit to business')}
            disabled={loading === 'cashDeposit'}
            className="w-full"
          >
            {loading === 'cashDeposit' ? 'Processing...' : 'Add Cash'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Expense</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amounts.expense || ''}
              onChange={(e) => setAmounts(prev => ({ ...prev, expense: Number(e.target.value) }))}
            />
          </div>
          <Button
            onClick={() => createQuickEntry('expense', amounts.expense, 'Business expense payment')}
            disabled={loading === 'expense'}
            className="w-full"
          >
            {loading === 'expense' ? 'Processing...' : 'Record Expense'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Owner Withdrawal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amounts.withdrawal || ''}
              onChange={(e) => setAmounts(prev => ({ ...prev, withdrawal: Number(e.target.value) }))}
            />
          </div>
          <Button
            onClick={() => createQuickEntry('withdrawal', amounts.withdrawal, 'Owner cash withdrawal')}
            disabled={loading === 'withdrawal'}
            className="w-full"
          >
            {loading === 'withdrawal' ? 'Processing...' : 'Record Withdrawal'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}