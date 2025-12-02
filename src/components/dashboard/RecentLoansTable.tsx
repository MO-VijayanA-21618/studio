'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDashboardStats } from '@/lib/firebase/dashboard-stats';
import { format } from 'date-fns';

export function RecentLoansTable() {
  const { t } = useLanguage();
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentLoans();
  }, []);

  const loadRecentLoans = async () => {
    try {
      const stats = await getDashboardStats();
      setRecentLoans(stats.recentLoans);
    } catch (error) {
      console.error('Error loading recent loans:', error);
    } finally {
      setLoading(false);
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'default';
      case 'Closed': return 'secondary';
      case 'Auctioned': return 'destructive';
      default: return 'outline';
    }
  };

  const statusTranslations: { [key: string]: string } = {
    Active: t.common.active,
    Closed: t.common.closed,
    Auctioned: t.common.auctioned
  };

  if (loading) {
    return <div>Loading recent loans...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Loan No</TableHead>
          <TableHead>{t.dashboard.customerName}</TableHead>
          <TableHead className="text-right">{t.dashboard.amount}</TableHead>
          <TableHead>{t.dashboard.date}</TableHead>
          <TableHead>{t.dashboard.status}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentLoans.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No loans found
            </TableCell>
          </TableRow>
        ) : (
          recentLoans.map((loan) => {
            const loanDate = loan.loanDate?.toDate() || new Date(loan.loanDate);
            return (
              <TableRow key={loan.id}>
                <TableCell className="font-medium">{loan.loanNumber || loan.id}</TableCell>
                <TableCell>{loan.customerName}</TableCell>
                <TableCell className="text-right">₹{loan.loanAmount?.toLocaleString('en-IN')}</TableCell>
                <TableCell>{format(loanDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(loan.status)}>
                    {statusTranslations[loan.status] || loan.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
