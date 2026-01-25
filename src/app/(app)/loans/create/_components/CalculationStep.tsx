'use client';
import { useEffect, useState } from 'react';
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
import { BrainCircuit, RefreshCw } from 'lucide-react';
import { ta } from '@/lib/constants/ta';
import { useSearchParams } from 'next/navigation';
import { generateLoanId } from '@/lib/utils/id-generator';
import { validateLoanNumber } from '@/lib/utils/loan-validation';

import type { LoanItem } from '@/lib/types';

interface CalculationStepProps {
  onGeneratePreview: () => void;
}

export function CalculationStep({ onGeneratePreview }: CalculationStepProps) {
  const { control, watch, setValue, setError, clearErrors } = useFormContext();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') !== null;
  const [isValidatingLoanNumber, setIsValidatingLoanNumber] = useState(false);

  const loanItems = watch('loanItems') as LoanItem[];
  const goldRate = watch('goldRate') as number;
  const netWeight = watch('netWeight') as number;
  const estimatedValue = watch('estimatedValue') as number;
  const margin = watch('margin') as number;
  const loanNumber = watch('loanNumber') as string;

  useEffect(() => {
    const totalWeight = loanItems.reduce((sum, item) => sum + item.weight, 0);
    setValue('netWeight', totalWeight);
  }, [loanItems, setValue]);

  // Generate loan number on mount if not in edit mode
  useEffect(() => {
    if (!isEditMode && !loanNumber) {
      generateLoanId().then(id => {
        setValue('loanNumber', id);
      });
    }
  }, [isEditMode, loanNumber, setValue]);

  // Validate loan number when it changes
  useEffect(() => {
    if (loanNumber && loanNumber.trim()) {
      setIsValidatingLoanNumber(true);
      const timeoutId = setTimeout(async () => {
        const isValid = await validateLoanNumber(loanNumber, isEditMode ? searchParams.get('edit') || undefined : undefined);
        if (!isValid) {
          setError('loanNumber', { message: 'This loan number is already in use' });
        } else {
          clearErrors('loanNumber');
        }
        setIsValidatingLoanNumber(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loanNumber, setError, clearErrors, isEditMode, searchParams]);

  const generateNewLoanNumber = async () => {
    const newId = await generateLoanId();
    setValue('loanNumber', newId);
  };

  useEffect(() => {
    if (goldRate && netWeight) {
      const calculatedValue = netWeight * goldRate;
      setValue('estimatedValue', calculatedValue);
    }
  }, [goldRate, netWeight, setValue]);

  useEffect(() => {
    if (!isEditMode && estimatedValue && margin) {
      const loanAmount = estimatedValue * (margin / 100);
      setValue('loanAmount', loanAmount, { shouldValidate: true });
    }
  }, [estimatedValue, margin, setValue, isEditMode]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="loanNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Number</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="NL2024001"
                    className={isValidatingLoanNumber ? 'border-yellow-300' : ''}
                  />
                </FormControl>
                {!isEditMode && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateNewLoanNumber}
                    title="Generate new loan number"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isValidatingLoanNumber && (
                <p className="text-sm text-yellow-600">Validating...</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="disbursementDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disbursement Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={field.value ? new Date(field.value.getTime() - field.value.getTimezoneOffset() * 60000).toISOString().split('T')[0] : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]}
                  onChange={e => field.onChange(new Date(e.target.value))}
                />
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
