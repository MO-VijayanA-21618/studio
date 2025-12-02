'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { processLoanRepayment } from '@/lib/firebase/loans-with-accounting';
import { useToast } from '@/hooks/use-toast';

interface RepaymentFormProps {
  loanId: string;
  customerName: string;
  outstandingAmount: number;
  onSuccess: () => void;
}

export function RepaymentForm({ loanId, customerName, outstandingAmount, onSuccess }: RepaymentFormProps) {
  const [principalAmount, setPrincipalAmount] = useState(outstandingAmount);
  const [interestAmount, setInterestAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRepayment = async () => {
    setLoading(true);
    try {
      // Get current user
      const { auth } = await import('@/lib/firebase/client');
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      await processLoanRepayment(
        loanId,
        principalAmount,
        interestAmount,
        customerName,
        auth.currentUser.uid
      );

      toast({
        title: "Repayment Successful",
        description: `₹${(principalAmount + interestAmount).toLocaleString()} received from ${customerName}`,
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Repayment Failed",
        description: error.message || "Failed to process repayment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = principalAmount + interestAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Repayment - {customerName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="principal">Principal Amount</Label>
          <Input
            id="principal"
            type="number"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(Number(e.target.value))}
            max={outstandingAmount}
          />
        </div>

        <div>
          <Label htmlFor="interest">Interest Amount</Label>
          <Input
            id="interest"
            type="number"
            value={interestAmount}
            onChange={(e) => setInterestAmount(Number(e.target.value))}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <Button 
          onClick={handleRepayment} 
          disabled={loading || totalAmount <= 0}
          className="w-full"
        >
          {loading ? 'Processing...' : `Receive ₹${totalAmount.toLocaleString()}`}
        </Button>
      </CardContent>
    </Card>
  );
}