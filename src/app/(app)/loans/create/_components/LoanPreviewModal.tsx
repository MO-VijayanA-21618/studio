'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateLoanPreview } from '@/ai/flows/generate-loan-preview';
import { ta } from '@/lib/constants/ta';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
    calculateTotalFineWeight,
    calculateEstimatedValue,
    calculateLoanEligibility,
} from '@/lib/loan/calculations';
import type { LoanItem, Customer } from '@/lib/types';


interface LoanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    customer: Customer;
    loanItems: LoanItem[];
    goldRate: number;
    loanAmount: number;
  };
}

export function LoanPreviewModal({ isOpen, onClose, data }: LoanPreviewModalProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      handleGenerateSummary();
    } else {
        // Reset state when closing
        setSummary('');
        setError('');
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError('');
    setSummary('');

    try {
      const totalFineWeight = calculateTotalFineWeight(data.loanItems);
      const estimatedValue = calculateEstimatedValue(totalFineWeight, data.goldRate);
      const loanEligibility = calculateLoanEligibility(estimatedValue);

      const previewInput = {
        customerName: data.customer.name,
        loanAmount: data.loanAmount,
        interestRate: 0.12, // Assuming a default 12% annual interest for preview
        loanTermMonths: 12, // Assuming a default 12-month term
        goldWeightInGrams: totalFineWeight,
        goldPurity: 91.6, // Assuming average purity for summary
        goldRatePerGram: data.goldRate,
        loanEligibility: loanEligibility,
      };

      const result = await generateLoanPreview(previewInput);
      setSummary(result.loanSummary);
    } catch (e) {
      console.error(e);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{ta.createLoan.loanPreview}</DialogTitle>
          <DialogDescription>
            An AI-generated summary of the loan for quick assessment.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Generating summary...</p>
            </div>
          )}
          {error && (
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={handleGenerateSummary}>
                Retry
              </Button>
            </div>
          )}
          {summary && (
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-secondary/30 p-4">
                <p>{summary}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
