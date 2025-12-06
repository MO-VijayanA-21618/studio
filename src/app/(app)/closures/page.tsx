'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ta } from "@/lib/constants/ta";
import { getLoans, getLoansByStatus, updateLoanStatus, createTransaction } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Search, AlertTriangle } from 'lucide-react';

export default function ClosuresPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [closureAmount, setClosureAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const snapshot = await getLoans(); // Get all loans
        const loansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate() || new Date()
        })) as Loan[];
        // Filter for closable loans (Active and Renewed)
        const closableLoans = loansData.filter(loan => 
          loan.status === 'Active' || loan.status === 'Renewed'
        );
        setActiveLoans(closableLoans);
        setFilteredLoans(closableLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchActiveLoans();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLoans(activeLoans);
    } else {
      const filtered = activeLoans.filter(loan => 
        loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLoans(filtered);
    }
  }, [activeLoans, searchTerm]);

  const handleClosure = async () => {
    if (!selectedLoan || !closureAmount) {
      toast({
        title: "Error",
        description: "Please select a loan and enter closure amount",
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to close this loan?\n\nCustomer: ${selectedLoan.customerName}\nLoan Amount: ₹${selectedLoan.loanAmount.toLocaleString()}\nClosure Amount: ₹${parseFloat(closureAmount).toLocaleString()}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await updateLoanStatus(selectedLoan.id!, 'Closed');
      
      await createTransaction({
        loanId: selectedLoan.id!,
        type: 'closure',
        amount: parseFloat(closureAmount),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan closed successfully"
      });
      
      setSelectedLoan(null);
      setClosureAmount('');
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
                <div className="mt-2 p-3 border rounded-lg bg-red-50 border-red-200">
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
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {loading ? 'Processing...' : 'Close Loan Permanently'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Loan Closure Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2 text-red-600">
              <p>• Loan closure is permanent and cannot be undone</p>
              <p>• Ensure all gold items are returned to customer</p>
              <p>• Enter final settlement amount including any fees</p>
              <p>• Confirmation dialog will appear before closure</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}