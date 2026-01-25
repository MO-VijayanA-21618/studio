'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from 'lucide-react';
import { getLoans } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { TopUpForm } from './_components/TopUpForm';

export default function TopUpLoanPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showTopUpForm, setShowTopUpForm] = useState(false);

  useEffect(() => {
    const fetchActiveLoans = async () => {
      try {
        const snapshot = await getLoans();
        const activeLoans = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            loanDate: doc.data().loanDate?.toDate() || new Date()
          }))
          .filter(loan => loan.status === 'Active' || loan.status === 'Renewed') as Loan[];
        
        setLoans(activeLoans);
        setFilteredLoans(activeLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoans();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = loans.filter(loan => 
        loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLoans(filtered);
    } else {
      setFilteredLoans(loans);
    }
  }, [loans, searchTerm]);

  const handleTopUp = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowTopUpForm(true);
  };

  if (showTopUpForm && selectedLoan) {
    return (
      <TopUpForm 
        existingLoan={selectedLoan}
        onBack={() => {
          setShowTopUpForm(false);
          setSelectedLoan(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Top Up Loan</h1>
        <p className="text-muted-foreground mt-2">Select an active or renewed loan to create a top-up</p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, loan ID, or customer ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active & Renewed Loans ({filteredLoans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading active loans...</p>
          ) : filteredLoans.length === 0 ? (
            <p>No active or renewed loans found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Loan ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Current Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="border-b">
                      <td className="p-2 font-mono text-xs">{loan.loanId || loan.id?.substring(0, 8) + '...'}</td>
                      <td className="p-2">{loan.customerName}</td>
                      <td className="p-2">₹{loan.loanAmount.toLocaleString()}</td>
                      <td className="p-2">{loan.loanDate.toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge className={loan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button 
                          size="sm"
                          onClick={() => handleTopUp(loan)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Top Up
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}