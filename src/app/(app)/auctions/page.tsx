'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ta } from "@/lib/constants/ta";
import { getLoansByStatus, updateLoanStatus, createTransaction } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Gavel, AlertCircle } from 'lucide-react';

export default function AuctionsPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
        const all = loansData;
        
        setActiveLoans(all);
        setOverdueLoans(overdue);
        setFilteredLoans(overdue);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchOverdueLoans();
  }, []);

  useEffect(() => {
    const loansToFilter = overdueLoans;
    if (!searchTerm) {
      setFilteredLoans(loansToFilter);
    } else {
      const filtered = loansToFilter.filter(loan => 
        loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLoans(filtered);
    }
  }, [overdueLoans, searchTerm]);

  const handleAuction = async () => {
    if (!selectedLoan || !auctionAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter auction amount",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to auction this loan?\n\nCustomer: ${selectedLoan.customerName}\nLoan Amount: ₹${selectedLoan.loanAmount.toLocaleString()}\nAuction Amount: ₹${parseFloat(auctionAmount).toLocaleString()}\nOverdue: ${getDaysOverdue(selectedLoan.loanDate)} days\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await updateLoanStatus(selectedLoan.id!, 'Auctioned');
      
      await createTransaction({
        loanId: selectedLoan.id!,
        type: 'auction',
        amount: parseFloat(auctionAmount),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan auctioned successfully"
      });
      
      setSelectedLoan(null);
      setAuctionAmount('');
      setSearchTerm('');
      
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
              <Label>Search & Select Overdue Loan</Label>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, loan no, customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {selectedLoan && (
                <div className="mt-2 p-3 border rounded-lg bg-orange-50 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedLoan.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{selectedLoan.loanAmount.toLocaleString()} • {selectedLoan.loanDate.toLocaleDateString()}
                      </div>
                      <Badge variant="destructive" className="mt-1">
                        {getDaysOverdue(selectedLoan.loanDate)} days overdue
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLoan(null)}>Change</Button>
                  </div>
                </div>
              )}
              
              {searchTerm && !selectedLoan && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                  {filteredLoans.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No overdue loans found</div>
                  ) : (
                    filteredLoans.map((loan) => (
                      <div 
                        key={loan.id}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{loan.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{loan.loanAmount.toLocaleString()} • {loan.loanDate.toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {getDaysOverdue(loan.loanDate)} days
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Gavel className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Process Auction'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              <AlertCircle className="h-5 w-5 inline mr-2 text-orange-600" />
              Overdue Loans ({overdueLoans.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueLoans.length === 0 ? (
              <p className="text-green-600">No overdue loans found. All loans are current!</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Loans overdue by more than 3 months are eligible for auction
                </p>
                {overdueLoans.slice(0, 5).map((loan) => (
                  <div key={loan.id} className="p-2 border rounded text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{loan.customerName}</div>
                        <div className="text-muted-foreground">₹{loan.loanAmount.toLocaleString()}</div>
                      </div>
                      <Badge variant="destructive">
                        {getDaysOverdue(loan.loanDate)} days
                      </Badge>
                    </div>
                  </div>
                ))}
                {overdueLoans.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{overdueLoans.length - 5} more overdue loans
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}