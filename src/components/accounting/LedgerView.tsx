'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getVouchers, getTrialBalance } from '@/lib/firebase/accounting';
import { VoucherEntry } from '@/lib/types/accounting';
import { format } from 'date-fns';

export function LedgerView() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadLedgerEntries();
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const trialBalance = await getTrialBalance();
      setAccounts(trialBalance);
      if (trialBalance.length > 0) {
        setSelectedAccount(trialBalance[0].accountId);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLedgerEntries = async () => {
    try {
      // Get all vouchers from last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const vouchers = await getVouchers(startDate, endDate);
      
      // Filter entries for selected account
      const entries = [];
      let runningBalance = 0;
      
      // Get opening balance
      const account = accounts.find(acc => acc.accountId === selectedAccount);
      if (account) {
        runningBalance = account.netBalance;
      }

      vouchers.forEach(voucher => {
        voucher.entries.forEach(entry => {
          if (entry.accountId === selectedAccount) {
            const amount = entry.debit - entry.credit;
            runningBalance += amount;
            
            const voucherDate = voucher.date instanceof Date ? voucher.date : voucher.date?.toDate?.() || new Date();
            
            entries.push({
              date: voucherDate,
              voucherNumber: voucher.voucherNumber,
              description: entry.description,
              debit: entry.debit,
              credit: entry.credit,
              balance: runningBalance
            });
          }
        });
      });

      setLedgerEntries(entries.reverse()); // Show latest first
    } catch (error) {
      console.error('Error loading ledger entries:', error);
    }
  };

  if (loading) {
    return <div>Loading ledger...</div>;
  }

  const selectedAccountInfo = accounts.find(acc => acc.accountId === selectedAccount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Ledger</CardTitle>
        <div className="flex gap-4 items-center">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-80">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.accountId} value={account.accountId}>
                  {account.accountCode} - {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedAccountInfo && (
            <div className="text-sm">
              Current Balance: <span className="font-bold">₹{selectedAccountInfo.netBalance.toLocaleString()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Voucher No</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No transactions found for this account
                </TableCell>
              </TableRow>
            ) : (
              ledgerEntries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.date instanceof Date && !isNaN(entry.date.getTime()) ? format(entry.date, 'dd/MM/yyyy') : 'Invalid Date'}</TableCell>
                  <TableCell>{entry.voucherNumber}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{entry.balance.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}