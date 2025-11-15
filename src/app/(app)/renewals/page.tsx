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

export default function RenewalsPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [renewalFee, setRenewalFee] = useState('');
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

  const handleRenewal = async () => {
    if (!selectedLoan || !renewalFee) {
      toast({
        title: "Error",
        description: "Please select a loan and enter renewal fee",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateLoanStatus(selectedLoan, 'Renewed');
      
      await createTransaction({
        loanId: selectedLoan,
        type: 'renewal',
        amount: parseFloat(renewalFee),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan renewed successfully"
      });
      
      setSelectedLoan('');
      setRenewalFee('');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew loan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.renewals}</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Renew Loan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Loan</Label>
              <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan to renew" />
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
              <Label>Renewal Fee</Label>
              <Input
                type="number"
                placeholder="Enter renewal fee"
                value={renewalFee}
                onChange={(e) => setRenewalFee(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleRenewal} 
              disabled={loading || !selectedLoan || !renewalFee}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Renew Loan'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Loans Due for Renewal</CardTitle>
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