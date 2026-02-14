'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ta } from "@/lib/constants/ta";
import { getLoans } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { PlusCircle, Eye, Search, TrendingUp, Edit } from 'lucide-react';
import Link from 'next/link';
import { LoanDetailsModal } from '@/components/loans/LoanDetailsModal';

export default function AllLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const snapshot = await getLoans();
        const loansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate() || new Date(),
          renewalDate: doc.data().renewalDate?.toDate() || null
        })) as Loan[];
        setLoans(loansData);
        setFilteredLoans(loansData);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Filter loans based on search and status
  useEffect(() => {
    let filtered = loans;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(loan => 
        loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }
    
    setFilteredLoans(filtered);
  }, [loans, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Auctioned': return 'bg-red-100 text-red-800';
      case 'Renewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">{ta.sidebar.allLoans}</h1>
        <div className="flex gap-2">
          <Link href="/loans/topup">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Top Up Loan
            </Button>
          </Link>
          <Link href="/loans/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Loan
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, loan no, customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Renewed">Renewed</SelectItem>
                <SelectItem value="Auctioned">Auctioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>All Loans ({filteredLoans.length} of {loans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading loans...</p>
          ) : filteredLoans.length === 0 ? (
            <p>{searchTerm || statusFilter !== 'all' ? 'No loans match your search criteria.' : 'No loans found. Create your first loan to get started.'}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Loan ID</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Date (Activation/Renewal)</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="border-b">
                      <td className="p-2 font-mono text-xs">{loan.loanId || loan.id?.substring(0, 8) + '...'}</td>
                      <td className="p-2">{loan.customerName}</td>
                      <td className="p-2">₹{loan.loanAmount.toLocaleString()}</td>
                      <td className="p-2">{(loan.status === 'Renewed' && loan.renewalDate) ? loan.renewalDate.toLocaleDateString('en-GB') : loan.loanDate.toLocaleDateString('en-GB')}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedLoan(loan);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Link href={`/loans/create?edit=${loan.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <LoanDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
      />
    </div>
  );
}
