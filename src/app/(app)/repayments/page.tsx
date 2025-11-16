'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ta } from "@/lib/constants/ta";
import { getLoans, getLoansByStatus, updateLoanStatus, createTransaction } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Check } from 'lucide-react';

export default function RepaymentsPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const snapshot = await getLoans(); // Get all loans instead of just Active
        const loansData = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Raw loan data:', data);
          return {
            id: doc.id,
            ...data,
            loanDate: data.loanDate?.toDate() || new Date()
          };
        }) as Loan[];
        
        console.log('Processed loans data:', loansData);
        // Filter for repayable loans (Active and Renewed)
        const repayableLoans = loansData.filter(loan => 
          loan.status === 'Active' || loan.status === 'Renewed'
        );
        setActiveLoans(repayableLoans);
        setFilteredLoans(repayableLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchActiveLoans();
  }, []);

  useEffect(() => {
    console.log('Search term:', searchTerm);
    console.log('Active loans:', activeLoans);
    
    if (!searchTerm) {
      setFilteredLoans(activeLoans);
    } else {
      const filtered = activeLoans.filter(loan => {
        const customerMatch = loan.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
        const loanIdMatch = loan.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const customerIdMatch = loan.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        console.log(`Loan ${loan.id}: customer=${loan.customerName}, matches: ${customerMatch || loanIdMatch || customerIdMatch}`);
        
        return customerMatch || loanIdMatch || customerIdMatch;
      });
      
      console.log('Filtered results:', filtered);
      setFilteredLoans(filtered);
    }
  }, [activeLoans, searchTerm]);

  const handleRepayment = async () => {
    if (!selectedLoan || !repaymentAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter repayment amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(repaymentAmount);
      
      if (amount >= selectedLoan.loanAmount) {
        await updateLoanStatus(selectedLoan.id!, 'Closed');
        toast({
          title: "Success",
          description: "Full repayment - Loan closed successfully"
        });
      } else {
        toast({
          title: "Success",
          description: "Partial repayment recorded successfully"
        });
      }
      
      await createTransaction({
        loanId: selectedLoan.id!,
        type: 'repayment',
        amount,
        date: new Date()
      });
      
      setSelectedLoan(null);
      setRepaymentAmount('');
      setSearchTerm('');
      
      // Refresh loans
      const snapshot = await getLoans();
      const loansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        loanDate: doc.data().loanDate?.toDate() || new Date()
      })) as Loan[];
      setActiveLoans(loansData);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process repayment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight mb-8">{ta.sidebar.repayments}</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Process Repayment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search & Select Loan</Label>
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
                <div className="mt-2 p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedLoan.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{selectedLoan.loanAmount.toLocaleString()} • {selectedLoan.loanDate.toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLoan(null)}>Change</Button>
                  </div>
                </div>
              )}
              
              {searchTerm && !selectedLoan && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                  {filteredLoans.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">No loans found</div>
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
                        <div className="font-medium">{loan.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          ₹{loan.loanAmount.toLocaleString()} • {loan.loanDate.toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label>Repayment Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleRepayment} 
              disabled={loading || !selectedLoan || !repaymentAmount}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Process Repayment'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Repayment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p>• Search and select a loan above</p>
              <p>• Enter repayment amount</p>
              <p>• Full repayment will close the loan</p>
              <p>• Partial repayments are recorded as transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
