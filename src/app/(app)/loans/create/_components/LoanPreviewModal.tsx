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
import { generateReceiptPDF } from '@/lib/utils/receipt-generator';

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
}

export function LoanPreviewModal({ isOpen, onClose, onConfirm, data }: LoanPreviewModalProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  
  const totalWeight = data.loanItems.reduce((sum, item) => sum + item.weight, 0);
  const estimatedValue = totalWeight * data.goldRate;
  const interestRate = 12; // 12% annual
  const monthlyInterest = (data.loanAmount * interestRate) / (12 * 100);
  
  // Generate EMI schedule for 12 months
  const generateEMISchedule = () => {
    const schedule = [];
    const principal = data.loanAmount / 12;
    
    for (let i = 1; i <= 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      date.setDate(1); // Set to first of month
      
      schedule.push({
        month: i,
        date: date.toLocaleDateString(),
        principal: principal,
        interest: monthlyInterest,
        total: principal + monthlyInterest
      });
    }
    return schedule;
  };
  
  const emiSchedule = generateEMISchedule();
  
  const generateReceipt = async () => {
    try {
      const receiptData = {
        customer: data.customer,
        loanItems: data.loanItems,
        goldRate: data.goldRate,
        loanAmount: data.loanAmount,
        totalWeight,
        estimatedValue,
        interestRate,
        customerPhoto: data.customerPhoto,
        emiSchedule
      };
      
      await generateReceiptPDF(receiptData);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Failed to generate receipt. Please try again.');
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
              <div>Loan Amount: <span className="font-medium">₹{data.loanAmount.toLocaleString()}</span></div>
              <div>Gold Rate: <span className="font-medium">₹{data.goldRate}/gram</span></div>
              <div>Total Weight: <span className="font-medium">{totalWeight}g</span></div>
              <div>Estimated Value: <span className="font-medium">₹{estimatedValue.toLocaleString()}</span></div>
              <div>Interest Rate: <span className="font-medium">{interestRate}% per annum</span></div>
              <div>Monthly Interest: <span className="font-medium">₹{monthlyInterest.toFixed(0)}</span></div>
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
          
          <Separator />
          
          {/* EMI Schedule */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">EMI Schedule (12 Months)</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReceipt(!showReceipt)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showReceipt ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            {showReceipt && (
              <div className="max-h-40 overflow-y-auto border rounded p-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-1">EMI No.</th>
                      <th className="text-left p-1">Due Date</th>
                      <th className="text-right p-1">Principal</th>
                      <th className="text-right p-1">Interest</th>
                      <th className="text-right p-1">Total EMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiSchedule.map((emi) => (
                      <tr key={emi.month} className="border-b">
                        <td className="p-1">{emi.month}</td>
                        <td className="p-1">{emi.date}</td>
                        <td className="text-right p-1">₹{emi.principal.toFixed(0)}</td>
                        <td className="text-right p-1">₹{emi.interest.toFixed(0)}</td>
                        <td className="text-right p-1 font-medium">₹{emi.total.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="text-sm mt-2">
              <div>Total EMI Amount: <span className="font-medium">₹{(emiSchedule[0].total * 12).toFixed(0)}</span></div>
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
            <Button onClick={onConfirm} className="flex-1">
              Confirm & Save Loan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
