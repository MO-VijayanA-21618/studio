'use client';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';
import { ta } from '@/lib/constants/ta';
import {
  calculateTotalFineWeight,
  calculateEstimatedValue,
  calculateLoanEligibility,
} from '@/lib/loan/calculations';
import type { LoanItem } from '@/lib/types';

interface CalculationStepProps {
  onGeneratePreview: () => void;
}

export function CalculationStep({ onGeneratePreview }: CalculationStepProps) {
  const { control, watch, setValue } = useFormContext();

  const loanItems = watch('loanItems') as LoanItem[];
  const goldRate = watch('goldRate') as number;

  const totalFineWeight = calculateTotalFineWeight(loanItems);
  const estimatedValue = calculateEstimatedValue(totalFineWeight, goldRate);
  const loanEligibility = calculateLoanEligibility(estimatedValue);

  useEffect(() => {
    setValue('loanAmount', loanEligibility, { shouldValidate: true });
  }, [loanEligibility, setValue]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="goldRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ta.createLoan.goldRate}</FormLabel>
              <FormControl>
                <Input type="number" placeholder="6500" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border bg-secondary/50 p-4">
        <div>
          <p className="text-sm text-muted-foreground">{ta.createLoan.totalWeight}</p>
          <p className="font-bold text-lg">{totalFineWeight.toFixed(2)} g</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{ta.createLoan.estimatedValue}</p>
          <p className="font-bold text-lg">₹{estimatedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{ta.createLoan.loanEligibility}</p>
          <p className="font-bold text-lg text-primary">₹{loanEligibility.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
      
       <FormField
          control={control}
          name="loanAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Amount Requested</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      <Button type="button" variant="outline" onClick={onGeneratePreview}>
        <BrainCircuit className="mr-2 h-4 w-4" />
        {ta.createLoan.generatePreview}
      </Button>
    </div>
  );
}
