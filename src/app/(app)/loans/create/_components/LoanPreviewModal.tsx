'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, Eye } from 'lucide-react';
import type { LoanItem, Customer } from '@/lib/types';
import { generateLoanReceipt } from '@/lib/utils/receipt-generator';
import { generateReceiptNumber, reserveReceiptNumber } from '@/lib/utils/id-generator';

interface LoanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: {
    customer: Customer;
    loanItems: LoanItem[];
    goldRate: number;
    loanAmount: number;
  };
  isEditMode?: boolean;
  existingReceiptNumber?: string;
}

export function LoanPreviewModal({ isOpen, onClose, onConfirm, data, isEditMode = false, existingReceiptNumber }: LoanPreviewModalProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(existingReceiptNumber || null);
  
  const totalWeight = data.loanItems.reduce((sum, item) => sum + item.weight, 0);
  const estimatedValue = totalWeight * data.goldRate;
  
  const generateReceipt = async () => {
    try {
      let currentReceiptNumber = receiptNumber;
      
      // Generate new receipt number if not exists or in edit mode without existing receipt
      if (!currentReceiptNumber || (isEditMode && !existingReceiptNumber)) {
        currentReceiptNumber = await generateReceiptNumber();
        await reserveReceiptNumber(currentReceiptNumber);
        setReceiptNumber(currentReceiptNumber);
      }
      
      const receiptData = {
        loanNumber: currentReceiptNumber,
        customerName: data.customer.name,
        customerPhone: data.customer.phone,
        customerAddress: data.customer.address,
        loanAmount: data.loanAmount,
        goldItems: data.loanItems,
        goldRate: data.goldRate,
        totalWeight,
        estimatedValue,
        loanDate: new Date()
      };
      
      const pdf = generateLoanReceipt(receiptData);
      pdf.save(`Loan_Receipt_${currentReceiptNumber}.pdf`);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // Generate receipt number if not exists
      if (!receiptNumber) {
        const newReceiptNumber = await generateReceiptNumber();
        await reserveReceiptNumber(newReceiptNumber);
        setReceiptNumber(newReceiptNumber);
        // Pass receipt number to parent component
        (window as any).currentReceiptNumber = newReceiptNumber;
      } else {
        (window as any).currentReceiptNumber = receiptNumber;
      }
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Loan Preview & Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Customer Details */}
          <div>
            <h3 className="font-semibold mb-2">Customer Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Name: {data.customer.name}</div>
              <div>Phone: {data.customer.phone}</div>
              <div className="col-span-2">Address: {data.customer.address}</div>
            </div>
          </div>
          
          <Separator />
          
          {/* Loan Summary */}
          <div>
            <h3 className="font-semibold mb-2">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Receipt Number: <span className="font-medium">{receiptNumber || 'Will be generated'}</span></div>
              <div>Loan Amount: <span className="font-medium">₹{data.loanAmount.toLocaleString()}</span></div>
              <div>Gold Rate: <span className="font-medium">₹{data.goldRate}/gram</span></div>
              <div>Total Weight: <span className="font-medium">{totalWeight}g</span></div>
              <div className="col-span-2">Estimated Value: <span className="font-medium">₹{estimatedValue.toLocaleString()}</span></div>
            </div>
          </div>
          
          <Separator />
          
          {/* Items Pledged */}
          <div>
            <h3 className="font-semibold mb-2">Items Pledged</h3>
            <div className="space-y-1 text-sm">
              {data.loanItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name}</span>
                  <span>{item.weight}g ({item.purity}K)</span>
                </div>
              ))}
            </div>
          </div>
          
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="outline" onClick={generateReceipt}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
            <Button 
              onClick={handleConfirm}
              className="flex-1"
              disabled={isConfirming}
            >
              {isConfirming ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Confirm & Update Loan' : 'Confirm & Save Loan')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
