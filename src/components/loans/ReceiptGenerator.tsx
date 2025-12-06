'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateLoanReceipt } from '@/lib/utils/receipt-generator';

interface ReceiptGeneratorProps {
  loanData: {
    loanNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    loanAmount: number;
    goldItems: Array<{
      name: string;
      weight: number;
      purity: string;
    }>;
    goldRate: number;
    totalWeight: number;
    estimatedValue: number;
    loanDate: Date;
  };
}

export function ReceiptGenerator({ loanData }: ReceiptGeneratorProps) {
  const handleGenerateReceipt = () => {
    try {
      const pdf = generateLoanReceipt(loanData);
      pdf.save(`Loan_Receipt_${loanData.loanNumber}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Error generating receipt. Please try again.');
    }
  };

  return (
    <Button onClick={handleGenerateReceipt} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Download Receipt
    </Button>
  );
}