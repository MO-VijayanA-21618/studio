'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { createVoucherEntry, getTrialBalance } from '@/lib/firebase/accounting';
import { JournalEntry, VoucherEntry } from '@/lib/types/accounting';
import { useToast } from '@/hooks/use-toast';

interface ManualEntry {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
}

export function ManualJournalEntry() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<ManualEntry[]>([
    { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }
  ]);
  const [voucherDescription, setVoucherDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const trialBalance = await getTrialBalance();
      setAccounts(trialBalance);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const addEntry = () => {
    setEntries([...entries, { accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: keyof ManualEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    
    // If account is selected, update code and name
    if (field === 'accountId') {
      const account = accounts.find(acc => acc.accountId === value);
      if (account) {
        updated[index].accountCode = account.accountCode;
        updated[index].accountName = account.accountName;
      }
    }
    
    setEntries(updated);
  };

  const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit || 0), 0);
  const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit || 0), 0);
  const isBalanced = totalDebits === totalCredits && totalDebits > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      toast({
        title: "Entry Not Balanced",
        description: "Total debits must equal total credits",
        variant: "destructive",
      });
      return;
    }

    if (!voucherDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a voucher description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { auth } = await import('@/lib/firebase/client');
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const journalEntries: JournalEntry[] = entries.map(entry => ({
        accountId: entry.accountId,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        description: entry.description || voucherDescription
      }));

      const voucher: Omit<VoucherEntry, 'id' | 'createdAt'> = {
        voucherNumber: `JE-${Date.now()}`,
        date: new Date(),
        type: 'ADJUSTMENT',
        description: voucherDescription,
        entries: journalEntries,
        totalAmount: totalDebits,
        createdBy: auth.currentUser.uid
      };

      await createVoucherEntry(voucher);

      toast({
        title: "Journal Entry Created",
        description: `Voucher ${voucher.voucherNumber} created successfully`,
      });

      // Reset form
      setEntries([{ accountId: '', accountCode: '', accountName: '', debit: 0, credit: 0, description: '' }]);
      setVoucherDescription('');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create journal entry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Journal Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="description">Voucher Description</Label>
          <Textarea
            id="description"
            placeholder="Enter description for this journal entry..."
            value={voucherDescription}
            onChange={(e) => setVoucherDescription(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Journal Entries</h3>
            <Button onClick={addEntry} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={entry.accountId}
                      onValueChange={(value) => updateEntry(index, 'accountId', value)}
                    >
                      <SelectTrigger>
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
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Entry description"
                      value={entry.description}
                      onChange={(e) => updateEntry(index, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={entry.debit || ''}
                      onChange={(e) => updateEntry(index, 'debit', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={entry.credit || ''}
                      onChange={(e) => updateEntry(index, 'credit', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      disabled={entries.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div className="space-y-1">
            <div>Total Debits: ₹{totalDebits.toLocaleString()}</div>
            <div>Total Credits: ₹{totalCredits.toLocaleString()}</div>
          </div>
          <div className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            {isBalanced ? '✓ Balanced' : '✗ Not Balanced'}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isBalanced || loading}
          className="w-full"
        >
          {loading ? 'Creating Entry...' : 'Create Journal Entry'}
        </Button>
      </CardContent>
    </Card>
  );
}