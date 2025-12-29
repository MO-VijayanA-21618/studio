'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Loan, LoanItem } from '@/lib/types';
import { addDoc, collection, updateDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';

interface TopUpFormProps {
  existingLoan: Loan;
  onBack: () => void;
}

export function TopUpForm({ existingLoan, onBack }: TopUpFormProps) {
  const [topUpAmount, setTopUpAmount] = useState<number>(0);
  const [disbursementDate, setDisbursementDate] = useState<Date>(new Date());
  const [additionalItems, setAdditionalItems] = useState<LoanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addItem = () => {
    setAdditionalItems([...additionalItems, { name: '', weight: 0, purity: '22' }]);
  };

  const updateItem = (index: number, field: keyof LoanItem, value: any) => {
    const updated = [...additionalItems];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalItems(updated);
  };

  const removeItem = (index: number) => {
    setAdditionalItems(additionalItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (topUpAmount <= 0) {
      alert('Please enter a valid top-up amount');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating top-up voucher...');
      // Update existing loan with top-up amount and additional items
      if (existingLoan.id) {
        const updatedLoanItems = [...existingLoan.loanItems, ...additionalItems];
        const additionalWeight = additionalItems.reduce((sum, item) => sum + item.weight, 0);
        
        await updateDoc(doc(db, 'loans', existingLoan.id), {
          loanAmount: existingLoan.loanAmount + topUpAmount,
          topUpAmount: (existingLoan.topUpAmount || 0) + topUpAmount,
          lastTopUpDate: new Date(),
          loanItems: updatedLoanItems,
          totalWeight: existingLoan.totalWeight + additionalWeight,
          status: 'Active'
        });
      }

      // Create accounting entries for top-up disbursement
      const { createVoucherEntry } = await import('@/lib/firebase/accounting');
      
      // Get account IDs by codes
      const accountsSnapshot = await getDocs(collection(db, 'accounts'));
      console.log('Accounts found:', accountsSnapshot.docs.length);
      const accounts = accountsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        console.log('Account:', data.code, doc.id);
        acc[data.code] = doc.id;
        return acc;
      }, {} as Record<string, string>);
      
      console.log('Account mapping:', accounts);
      
      const voucherId = await createVoucherEntry({
        voucherNumber: `TOPUP-${Date.now()}`,
        date: Timestamp.fromDate(disbursementDate),
        type: 'LOAN_DISBURSEMENT',
        description: `Top-up loan disbursement for ${existingLoan.customerName}`,
        reference: existingLoan.id || '',
        entries: [
          {
            accountId: accounts['1201'],
            accountCode: '1201',
            accountName: 'Loans Receivable',
            description: `Top-up loan to ${existingLoan.customerName}`,
            debit: topUpAmount,
            credit: 0
          },
          {
            accountId: accounts['1001'],
            accountCode: '1001', 
            accountName: 'Cash in Hand',
            description: `Cash disbursed for top-up`,
            debit: 0,
            credit: topUpAmount
          }
        ]
      });
      
      console.log('Voucher created:', voucherId);

      // Create transaction record
      await addDoc(collection(db, 'transactions'), {
        loanId: existingLoan.id,
        customerId: existingLoan.customerId,
        customerName: existingLoan.customerName,
        type: 'topup',
        amount: topUpAmount,
        date: disbursementDate,
        description: `Top-up loan amount: ₹${topUpAmount.toLocaleString()}`
      });

      router.push('/loans');
    } catch (error) {
      console.error('Error processing top-up:', error);
      alert('Error processing top-up');
    } finally {
      setLoading(false);
    }
  };

  const calculateItemValue = (item: LoanItem) => {
    const purityMultiplier = {
      '24': 1,
      '22': 0.916,
      '18': 0.75,
      '14': 0.583
    }[item.purity] || 0.916;
    return item.weight * (existingLoan.goldRate || 6500) * purityMultiplier;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Top Up Loan</h1>
          <p className="text-muted-foreground">Customer: {existingLoan.customerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Loan Amount</Label>
              <p className="text-2xl font-bold">₹{existingLoan.loanAmount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Previous Top-ups</Label>
              <p>₹{(existingLoan.topUpAmount || 0).toLocaleString()}</p>
            </div>
            <div>
              <Label>Total Weight</Label>
              <p>{existingLoan.totalWeight}g</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top-Up Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topUpAmount">Enter Top-Up Amount</Label>
              <Input
                id="topUpAmount"
                type="number"
                value={topUpAmount || ''}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                placeholder="Enter amount"
                className="text-lg"
              />
            </div>
            
            <div>
              <Label htmlFor="disbursementDate">Disbursement Date</Label>
              <Input
                id="disbursementDate"
                type="date"
                value={new Date(disbursementDate.getTime() - disbursementDate.getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                onChange={(e) => setDisbursementDate(new Date(e.target.value))}
              />
            </div>
            
            {topUpAmount > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Amount:</span>
                    <span>₹{existingLoan.loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top-Up Amount:</span>
                    <span className="text-green-600">+₹{topUpAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>New Total:</span>
                    <span>₹{(existingLoan.loanAmount + topUpAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Existing Pledged Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item Name</th>
                  <th className="text-left p-2">Weight (g)</th>
                  <th className="text-left p-2">Purity</th>
                  <th className="text-left p-2">Estimated Value</th>
                </tr>
              </thead>
              <tbody>
                {existingLoan.loanItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.weight}g</td>
                    <td className="p-2">{item.purity}K</td>
                    <td className="p-2">₹{calculateItemValue(item).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Additional Pledge Items (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          {additionalItems.length > 0 && (
            <div className="space-y-4 mb-4">
              {additionalItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="e.g., Gold Ring"
                    />
                  </div>
                  <div>
                    <Label>Weight (g)</Label>
                    <Input
                      type="text"
                      value={item.weight || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        updateItem(index, 'weight', value ? parseFloat(value) : 0);
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Purity</Label>
                    <select
                      value={item.purity}
                      onChange={(e) => updateItem(index, 'purity', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="24">24K</option>
                      <option value="22">22K</option>
                      <option value="18">18K</option>
                      <option value="14">14K</option>
                    </select>
                  </div>
                  <div>
                    <Label>Est. Value</Label>
                    <p className="p-2 text-sm">₹{calculateItemValue(item).toLocaleString()}</p>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Additional Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={loading || topUpAmount <= 0}
          >
            {loading ? 'Processing...' : 'Disburse Top-Up Amount'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}