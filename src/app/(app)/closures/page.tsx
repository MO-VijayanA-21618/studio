'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ta } from "@/lib/constants/ta";
import { getLoansByStatus, updateLoanStatus, createTransaction } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function ClosuresPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [closureAmount, setClosureAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const snapshot = await getLoansByStatus('Active');
        const loansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate() || new Date()
        })) as Loan[];
        setActiveLoans(loansData);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchActiveLoans();
  }, []);

  const handleClosure = async () => {
    if (!selectedLoan || !closureAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter closure amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateLoanStatus(selectedLoan, 'Closed');
      
      await createTransaction({
        loanId: selectedLoan,
        type: 'closure',
        amount: parseFloat(closureAmount),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan closed successfully"
      });
      
      setSelectedLoan('');
      setClosureAmount('');
      
      // Refresh loans
      const snapshot = await getLoansByStatus('Active');
      const loansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loanDate: doc.data().loanDate?.toDate() || new Date()
      })) as Loan[];
      setActiveLoans(loansData);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close loan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.closures}</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Close Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Loan</Label>
              <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan to close" />
                </SelectTrigger>
                <SelectContent>
                  {activeLoans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id!}>
                      {loan.customerName} - ₹{loan.loanAmount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Final Settlement Amount</Label>
              <Input
                type="number"
                placeholder="Enter final amount"
                value={closureAmount}
                onChange={(e) => setClosureAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleClosure} 
              disabled={loading || !selectedLoan || !closureAmount}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Close Loan'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Loans ({activeLoans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLoans.length === 0 ? (
              <p>No active loans found.</p>
            ) : (
              <div className="space-y-2">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="p-3 border rounded">
                    <div className="font-medium">{loan.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      Amount: ₹{loan.loanAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Date: {loan.loanDate.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}