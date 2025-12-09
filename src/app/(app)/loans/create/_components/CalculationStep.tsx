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

import type { LoanItem } from '@/lib/types';

interface CalculationStepProps {
  onGeneratePreview: () => void;
}

export function CalculationStep({ onGeneratePreview }: CalculationStepProps) {
  const { control, watch, setValue } = useFormContext();

  const loanItems = watch('loanItems') as LoanItem[];
  const goldRate = watch('goldRate') as number;
  const netWeight = watch('netWeight') as number;
  const estimatedValue = watch('estimatedValue') as number;
  const margin = watch('margin') as number;

  useEffect(() => {
    const totalWeight = loanItems.reduce((sum, item) => sum + item.weight, 0);
    setValue('netWeight', totalWeight);
  }, [loanItems, setValue]);

  useEffect(() => {
    if (goldRate && netWeight) {
      const calculatedValue = netWeight * goldRate;
      setValue('estimatedValue', calculatedValue);
    }
  }, [goldRate, netWeight, setValue]);

  useEffect(() => {
    if (estimatedValue && margin) {
      const loanAmount = estimatedValue * (margin / 100);
      setValue('loanAmount', loanAmount, { shouldValidate: true });
    }
  }, [estimatedValue, margin, setValue]);

  useEffect(() => {
    if (!margin) {
      setValue('margin', 75);
    }
  }, []);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="netWeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ta.createLoan.totalWeight}</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="goldRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ta.createLoan.goldRate}</FormLabel>
              <FormControl>
                <Input type="text" placeholder="6500" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || '')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="estimatedValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ta.createLoan.estimatedValue}</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="margin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Margin (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="75" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="loanAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button type="button" variant="outline" onClick={onGeneratePreview}>
        <BrainCircuit className="mr-2 h-4 w-4" />
        {ta.createLoan.generatePreview}
      </Button>
    </div>
  );
}
