'use server';

/**
 * @fileOverview An AI agent to generate a financial summary of a loan.
 *
 * - generateLoanPreview - A function that handles the loan preview generation process.
 * - GenerateLoanPreviewInput - The input type for the generateLoanPreview function.
 * - GenerateLoanPreviewOutput - The return type for the generateLoanPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLoanPreviewInputSchema = z.object({
  customerName: z.string().describe('The name of the customer taking the loan.'),
  loanAmount: z.number().describe('The total amount of the loan.'),
  interestRate: z.number().describe('The annual interest rate of the loan (as a decimal).'),
  loanTermMonths: z.number().describe('The term of the loan in months.'),
  goldWeightInGrams: z.number().describe('The total weight of the gold pledged as collateral, in grams.'),
  goldPurity: z.number().describe('The purity of the gold, as a percentage (e.g., 91.6 for 22K gold).'),
  goldRatePerGram: z.number().describe('The current market rate of gold per gram.'),
  loanEligibility: z.number().describe('The loan eligibility amount based on the gold pledged.'),
});
export type GenerateLoanPreviewInput = z.infer<typeof GenerateLoanPreviewInputSchema>;

const GenerateLoanPreviewOutputSchema = z.object({
  loanSummary: z.string().describe('A concise and easily understandable summary of the loan terms and financial implications.'),
});
export type GenerateLoanPreviewOutput = z.infer<typeof GenerateLoanPreviewOutputSchema>;

export async function generateLoanPreview(input: GenerateLoanPreviewInput): Promise<GenerateLoanPreviewOutput> {
  return generateLoanPreviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLoanPreviewPrompt',
  input: {schema: GenerateLoanPreviewInputSchema},
  output: {schema: GenerateLoanPreviewOutputSchema},
  prompt: `You are an AI assistant that helps loan officers quickly understand the financial implications of a loan.

  Based on the following loan details, generate a concise and easily understandable summary of the loan terms and financial implications for the loan officer.

  Customer Name: {{{customerName}}}
  Loan Amount: {{{loanAmount}}}
  Interest Rate: {{{interestRate}}}
  Loan Term (Months): {{{loanTermMonths}}}
  Gold Weight (Grams): {{{goldWeightInGrams}}}
  Gold Purity: {{{goldPurity}}}
  Gold Rate per Gram: {{{goldRatePerGram}}}
  Loan Eligibility: {{{loanEligibility}}}
  `,
});

const generateLoanPreviewFlow = ai.defineFlow(
  {
    name: 'generateLoanPreviewFlow',
    inputSchema: GenerateLoanPreviewInputSchema,
    outputSchema: GenerateLoanPreviewOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
