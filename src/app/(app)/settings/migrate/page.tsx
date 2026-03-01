'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { previewTransactionMigration } from '@/lib/utils/migrate-transactions';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { AlertCircle, CheckCircle, Eye, Save } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function MigrateTransactionsPage() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selections, setSelections] = useState<Record<string, 'principal' | 'interest'>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<any>(null);

  const handleLoadTransactions = async () => {
    setLoading(true);
    try {
      const data = await previewTransactionMigration();
      setTransactions(data.transactions || []);
      const defaultSelections: Record<string, 'principal' | 'interest'> = {};
      const defaultSelected: Record<string, boolean> = {};
      data.transactions.forEach((t: any) => {
        defaultSelections[t.id] = 'principal';
        defaultSelected[t.id] = false;
      });
      setSelections(defaultSelections);
      setSelected(defaultSelected);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransactions = async () => {
    const selectedTransactions = transactions.filter(t => selected[t.id]);
    
    if (selectedTransactions.length === 0) {
      alert('Please select at least one transaction to update');
      return;
    }

    if (!confirm(`Are you sure you want to update ${selectedTransactions.length} selected transactions?`)) {
      return;
    }

    setLoading(true);
    let updated = 0;
    const errors = [];

    try {
      for (const transaction of selectedTransactions) {
        try {
          const type = selections[transaction.id];
          await updateDoc(doc(db, 'transactions', transaction.id), {
            principalAmount: type === 'principal' ? transaction.amount : 0,
            interestAmount: type === 'interest' ? transaction.amount : 0,
            description: transaction.description || `${type === 'principal' ? 'Principal' : 'Interest'} repayment (migrated)`
          });
          updated++;
        } catch (error) {
          errors.push({ id: transaction.id, error: error.message });
        }
      }

      setResult({
        success: true,
        message: `Successfully updated ${updated} of ${selectedTransactions.length} selected transactions`,
        updated,
        errors
      });
      setTransactions(transactions.filter(t => !selected[t.id]));
      setSelected({});
    } catch (error) {
      setResult({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Migrate Repayment Transactions</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Load transactions, select which ones to update, choose Principal or Interest for each, then save.
        </AlertDescription>
      </Alert>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Load Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLoadTransactions} disabled={loading}>
            <Eye className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Load Transactions'}
          </Button>
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 2: Select Transactions ({selectedCount} of {transactions.length} selected)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Checkbox
                        checked={transactions.length > 0 && transactions.every(t => selected[t.id])}
                        onCheckedChange={(checked) => {
                          const newSelected = { ...selected };
                          transactions.forEach(t => {
                            newSelected[t.id] = checked as boolean;
                          });
                          setSelected(newSelected);
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="p-2">
                        <Checkbox
                          checked={selected[t.id] || false}
                          onCheckedChange={(checked) => setSelected({ ...selected, [t.id]: checked as boolean })}
                        />
                      </td>
                      <td className="p-2">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                      <td className="p-2">{t.customerName}</td>
                      <td className="p-2">₹{t.amount.toLocaleString()}</td>
                      <td className="p-2">
                        <RadioGroup
                          value={selections[t.id]}
                          onValueChange={(value) => setSelections({ ...selections, [t.id]: value as 'principal' | 'interest' })}
                        >
                          <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="principal" id={`${t.id}-principal`} />
                              <Label htmlFor={`${t.id}-principal`}>Principal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="interest" id={`${t.id}-interest`} />
                              <Label htmlFor={`${t.id}-interest`}>Interest</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Step 3: Save Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleUpdateTransactions} disabled={loading || selectedCount === 0}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : `Update ${selectedCount} Selected Transaction${selectedCount !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {result && (
        <Alert className={result.success ? 'bg-green-50' : 'bg-red-50'}>
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <p className="font-medium">{result.message}</p>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm">Errors:</p>
                {result.errors.map((e: any, i: number) => (
                  <p key={i} className="text-xs">{e.id}: {e.error}</p>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}