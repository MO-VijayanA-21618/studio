import type { LoanItem } from '@/lib/types';

const LTV_RATIO = 0.75; // Loan-to-Value Ratio is 75%

// Purity to percentage mapping (e.g., 22K is approx 91.6% pure gold)
const purityPercentage: Record<string, number> = {
  '24': 1.0,
  '22': 0.9167,
  '18': 0.75,
  '14': 0.585,
};

/**
 * Calculates the total fine weight of all gold items.
 * @param items - An array of LoanItem objects.
 * @returns The total weight adjusted for purity.
 */
export const calculateTotalFineWeight = (items: LoanItem[]): number => {
  return items.reduce((total, item) => {
    const purityFactor = purityPercentage[item.purity] || 0;
    return total + item.weight * purityFactor;
  }, 0);
};

/**
 * Calculates the total estimated value of the gold.
 * @param totalFineWeight - The total fine weight of the gold.
 * @param goldRatePerGram - The current market rate for gold per gram.
 * @returns The total estimated value.
 */
export const calculateEstimatedValue = (totalFineWeight: number, goldRatePerGram: number): number => {
  return totalFineWeight * goldRatePerGram;
};

/**
 * Calculates the maximum loan amount eligible based on the gold's value.
 * @param estimatedValue - The total estimated value of the gold.
 * @returns The eligible loan amount (75% of the estimated value).
 */
export const calculateLoanEligibility = (estimatedValue: number): number => {
  return estimatedValue * LTV_RATIO;
};
