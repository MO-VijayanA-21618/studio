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

export default function RenewalsPage() {
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [renewalFee, setRenewalFee] = useState('');
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
        // Filter for renewable loans (Active only)
        const renewableLoans = loansData.filter(loan => loan.status === 'Active');
        setActiveLoans(renewableLoans);
        setFilteredLoans(renewableLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    fetchActiveLoans();
  }, []);

  // Filter loans based on search term
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
      await updateLoanStatus(selectedLoan.id!, 'Renewed');
      
      await createTransaction({
        loanId: selectedLoan.id!,
        type: 'renewal',
        amount: parseFloat(renewalFee),
        date: new Date()
      });

      toast({
        title: "Success",
        description: "Loan renewed successfully"
      });
      
      setSelectedLoan(null);
      setRenewalFee('');
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
              
              {/* Selected Loan Display */}
              {selectedLoan && (
                <div className="mt-2 p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedLoan.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        ₹{selectedLoan.loanAmount.toLocaleString()} • {selectedLoan.loanDate.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedLoan(null)}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Search Results */}
              {searchTerm && !selectedLoan && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                  {filteredLoans.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      No loans found matching "{searchTerm}"
                    </div>
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
                        <div className="text-xs text-muted-foreground font-mono">
                          ID: {loan.id?.substring(0, 8)}...
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
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
            <CardTitle>Active Loans ({activeLoans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {activeLoans.length === 0 ? (
              <p>No active loans found.</p>
            ) : (
              <div className="text-sm text-muted-foreground mb-2">
                Search above to find and select a loan for renewal
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}