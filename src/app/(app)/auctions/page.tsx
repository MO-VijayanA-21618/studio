'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ta } from "@/lib/constants/ta";
import { getLoansByStatus, updateLoanStatus, createTransaction } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AuctionsPage() {
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [auctionAmount, setAuctionAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOverdueLoans = async () => {
      try {
        const snapshot = await getLoansByStatus('Active');
        const loansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate() || new Date()
        })) as Loan[];
        
        // Filter loans older than 3 months (example criteria)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const overdue = loansData.filter(loan => loan.loanDate < threeMonthsAgo);
        setOverdueLoans(overdue);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchOverdueLoans();
  }, []);

  const handleAuction = async () => {
    if (!selectedLoan || !auctionAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter auction amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateLoanStatus(selectedLoan, 'Auctioned');
      
      await createTransaction({
        loanId: selectedLoan,
        type: 'auction',
        amount: parseFloat(auctionAmount),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan auctioned successfully"
      });
      
      setSelectedLoan('');
      setAuctionAmount('');
      
      // Refresh loans
      const snapshot = await getLoansByStatus('Active');
      const loansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loanDate: doc.data().loanDate?.toDate() || new Date()
      })) as Loan[];
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const overdue = loansData.filter(loan => loan.loanDate < threeMonthsAgo);
      setOverdueLoans(overdue);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to auction loan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (loanDate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - loanDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.auctions}</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Auction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Overdue Loan</Label>
              <Select value={selectedLoan} onValueChange={setSelectedLoan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a loan for auction" />
                </SelectTrigger>
                <SelectContent>
                  {overdueLoans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id!}>
                      {loan.customerName} - ₹{loan.loanAmount.toLocaleString()} ({getDaysOverdue(loan.loanDate)} days overdue)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Auction Amount</Label>
              <Input
                type="number"
                placeholder="Enter auction amount"
                value={auctionAmount}
                onChange={(e) => setAuctionAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleAuction} 
              disabled={loading || !selectedLoan || !auctionAmount}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Process Auction'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Overdue Loans ({overdueLoans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {overdueLoans.length === 0 ? (
              <p>No overdue loans found.</p>
            ) : (
              <div className="space-y-2">
                {overdueLoans.map((loan) => (
                  <div key={loan.id} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{loan.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Amount: ₹{loan.loanAmount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Date: {loan.loanDate.toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="destructive">
                        {getDaysOverdue(loan.loanDate)} days overdue
                      </Badge>
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