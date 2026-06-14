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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
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
  const silverRate = watch('silverRate') as number;
  const netWeight = watch('netWeight') as number;
  const estimatedValue = watch('estimatedValue') as number;
  const margin = watch('margin') as number;
  const loanNumber = watch('loanNumber') as string;

  useEffect(() => {
    const totalWeight = loanItems.reduce((sum, item) => sum + item.weight, 0);
    setValue('netWeight', totalWeight);
  }, [loanItems, setValue]);

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

  // Load silver rate from settings on mount
  useEffect(() => {
    const loadRates = async () => {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        if (snap.data().defaultSilverRate) setValue('silverRate', snap.data().defaultSilverRate);
      }
    };
    loadRates();
  }, []);

  // Recalculate estimated value based on each item's pledgeType
  useEffect(() => {
    if (!loanItems?.length) return;
    const total = loanItems.reduce((sum, item) => {
      const pledgeType = (item as any).pledgeType || 'gold';
      const weight = parseFloat(item.weight as any) || 0;
      if (pledgeType === 'gold' && goldRate && weight && item.purity) {
        return sum + weight * goldRate * (parseInt(item.purity) / 24);
      } else if (pledgeType === 'silver' && silverRate && weight) {
        return sum + weight * silverRate;
      }
      return sum;
    }, 0);
    setValue('estimatedValue', Math.round(total));
  }, [loanItems, goldRate, silverRate, setValue]);

  useEffect(() => {
    if (!isEditMode && estimatedValue && margin) {
      const loanAmount = estimatedValue * (margin / 100);
      setValue('loanAmount', loanAmount, { shouldValidate: true });
    }
  }, [estimatedValue, margin, setValue, isEditMode]);

  useEffect(() => {
    if (!margin) setValue('margin', 75);
    const interestRate = watch('interestRate');
    if (interestRate === undefined || interestRate === null) setValue('interestRate', 2);
  }, []);


  const goldItems = loanItems?.filter(i => ((i as any).pledgeType || 'gold') === 'gold') || [];
  const silverItems = loanItems?.filter(i => (i as any).pledgeType === 'silver') || [];
  const otherItems = loanItems?.filter(i => (i as any).pledgeType === 'other') || [];

  const goldWeight = goldItems.reduce((s, i) => s + (parseFloat(i.weight as any) || 0), 0);
  const silverWeight = silverItems.reduce((s, i) => s + (parseFloat(i.weight as any) || 0), 0);
  const otherWeight = otherItems.reduce((s, i) => s + (parseFloat(i.weight as any) || 0), 0);

  const goldValue = goldItems.reduce((s, i) => s + (parseFloat(i.weight as any) || 0) * (goldRate || 0) * (parseInt(i.purity) / 24), 0);
  const silverValue = silverItems.reduce((s, i) => s + (parseFloat(i.weight as any) || 0) * (silverRate || 0), 0);

  return (
    <div className="space-y-6">
      {/* Rates Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="goldRate" render={({ field }) => (
          <FormItem>
            <FormLabel>{ta.createLoan.goldRate}</FormLabel>
            <FormControl>
              <Input type="text" placeholder="6500" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || '')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="silverRate" render={({ field }) => (
          <FormItem>
            <FormLabel>Silver Rate (₹/gram)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="100" value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      {/* Grouped Estimate Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3">Type</th>
              <th className="text-right p-3">Weight (g)</th>
              <th className="text-right p-3">Rate (₹/g)</th>
              <th className="text-right p-3">Est. Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {goldItems.length > 0 && (
              <tr className="border-t">
                <td className="p-3 font-medium">தங்கம் (Gold)</td>
                <td className="p-3 text-right">{goldWeight.toFixed(2)}</td>
                <td className="p-3 text-right">{goldRate || '-'}</td>
                <td className="p-3 text-right font-medium text-yellow-700">₹{Math.round(goldValue).toLocaleString()}</td>
              </tr>
            )}
            {silverItems.length > 0 && (
              <tr className="border-t">
                <td className="p-3 font-medium">வெள்ளி (Silver)</td>
                <td className="p-3 text-right">{silverWeight.toFixed(2)}</td>
                <td className="p-3 text-right">{silverRate || '-'}</td>
                <td className="p-3 text-right font-medium text-gray-600">₹{Math.round(silverValue).toLocaleString()}</td>
              </tr>
            )}
            {otherItems.length > 0 && (
              <tr className="border-t">
                <td className="p-3 font-medium">மற்றவை (Other)</td>
                <td className="p-3 text-right">{otherWeight.toFixed(2)}</td>
                <td className="p-3 text-right">-</td>
                <td className="p-3 text-right text-muted-foreground">-</td>
              </tr>
            )}
            <tr className="border-t bg-muted font-bold">
              <td className="p-3">மொத்தம் (Total)</td>
              <td className="p-3 text-right">{(goldWeight + silverWeight + otherWeight).toFixed(2)}</td>
              <td className="p-3"></td>
              <td className="p-3 text-right text-primary">₹{Math.round(goldValue + silverValue).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Loan Calculation Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="estimatedValue" render={({ field }) => (
          <FormItem>
            <FormLabel>{ta.createLoan.estimatedValue}</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="margin" render={({ field }) => (
          <FormItem>
            <FormLabel>Margin (%)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="75" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="loanAmount" render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Amount</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="interestRate" render={({ field }) => (
          <FormItem>
            <FormLabel>Interest Rate (%)</FormLabel>
            <FormControl>
              <Input type="number" step="0.1" {...field} value={field.value ?? 2} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>

      {/* Loan Number & Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={control} name="loanNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Loan Number</FormLabel>
            <div className="flex gap-2">
              <FormControl>
                <Input {...field} placeholder="NL2024001" className={isValidatingLoanNumber ? 'border-yellow-300' : ''} />
              </FormControl>
              {!isEditMode && (
                <Button type="button" variant="outline" size="sm" onClick={generateNewLoanNumber} title="Generate new loan number">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isValidatingLoanNumber && <p className="text-sm text-yellow-600">Validating...</p>}
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="disbursementDate" render={({ field }) => (
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
        )} />
      </div>

      <Button type="button" variant="outline" onClick={onGeneratePreview}>
        <BrainCircuit className="mr-2 h-4 w-4" />
        {ta.createLoan.generatePreview}
      </Button>
    </div>
  );
}
