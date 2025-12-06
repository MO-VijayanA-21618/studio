'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVouchers } from '@/lib/firebase/accounting';
import { VoucherEntry } from '@/lib/types/accounting';
import { format } from 'date-fns';

export function VoucherEntries() {
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const data = await getVouchers(start, end);
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading vouchers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voucher Entries</CardTitle>
        <div className="flex gap-4 items-center">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Button onClick={loadVouchers}>Filter</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell>{voucher.voucherNumber}</TableCell>
                <TableCell>
                  {voucher.date ? format(voucher.date.toDate ? voucher.date.toDate() : new Date(voucher.date), 'dd/MM/yyyy') : '-'}
                </TableCell>
                <TableCell>{voucher.type}</TableCell>
                <TableCell>{voucher.description}</TableCell>
                <TableCell className="text-right">₹{voucher.totalAmount.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}