'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ta } from "@/lib/constants/ta";
import { getLoans } from '@/lib/firebase/firestore';
import { Loan } from '@/lib/types';
import { PlusCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AllLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const snapshot = await getLoans();
        const loansData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate() || new Date()
        })) as Loan[];
        setLoans(loansData);
      } catch (error) {
        console.error('Error fetching loans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

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
        <Link href="/loans/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Loan
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Loans ({loans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading loans...</p>
          ) : loans.length === 0 ? (
            <p>No loans found. Create your first loan to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Customer</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-b">
                      <td className="p-2">{loan.customerName}</td>
                      <td className="p-2">₹{loan.loanAmount.toLocaleString()}</td>
                      <td className="p-2">{loan.loanDate.toLocaleDateString()}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
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
