'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getVouchers } from '@/lib/firebase/accounting';
import { VoucherEntry } from '@/lib/types/accounting';
import { format } from 'date-fns';

export function DayBook() {
  const [vouchers, setVouchers] = useState<VoucherEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDayBook();
  }, []);

  const loadDayBook = async () => {
    try {
      const date = new Date(selectedDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const data = await getVouchers(startOfDay, endOfDay);
      setVouchers(data);
    } catch (error) {
      console.error('Error loading day book:', error);
    } finally {
      setLoading(false);
    }
  };

  const cashReceipts = vouchers
    .filter(v => v.type === 'LOAN_REPAYMENT')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const cashPayments = vouchers
    .filter(v => v.type === 'LOAN_DISBURSEMENT')
    .reduce((sum, v) => sum + v.totalAmount, 0);

  const netCashFlow = cashReceipts - cashPayments;

  if (loading) {
    return <div>Loading day book...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day Book</CardTitle>
        <div className="flex gap-4 items-center">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <Button onClick={loadDayBook}>Load</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Cash Receipts</div>
              <div className="text-2xl font-bold text-green-600">₹{cashReceipts.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Cash Payments</div>
              <div className="text-2xl font-bold text-red-600">₹{cashPayments.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Net Cash Flow</div>
              <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netCashFlow.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Voucher No</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
              <TableHead className="text-right">Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers.map((voucher) => (
              <TableRow key={voucher.id}>
                <TableCell>
                  {voucher.date ? format(voucher.date.toDate ? voucher.date.toDate() : new Date(voucher.date), 'HH:mm') : '-'}
                </TableCell>
                <TableCell>{voucher.voucherNumber}</TableCell>
                <TableCell>{voucher.type}</TableCell>
                <TableCell>{voucher.description}</TableCell>
                <TableCell className="text-right">
                  {voucher.type === 'LOAN_REPAYMENT' ? `₹${voucher.totalAmount.toLocaleString()}` : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {voucher.type === 'LOAN_DISBURSEMENT' ? `₹${voucher.totalAmount.toLocaleString()}` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}