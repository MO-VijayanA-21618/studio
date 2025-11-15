import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  address: z.string().min(5, "Address is too short"),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const LoanItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Item name is required"),
  weight: z.number().positive("Weight must be positive"),
  purity: z.enum(['24', '22', '18', '14']),
});
export type LoanItem = z.infer<typeof LoanItemSchema>;

export const LoanSchema = z.object({
  id: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  loanItems: z.array(LoanItemSchema),
  goldRate: z.number().positive(),
  totalWeight: z.number(),
  estimatedValue: z.number(),
  loanAmount: z.number().positive(),
  loanDate: z.date(),
  status: z.enum(['Active', 'Closed', 'Auctioned', 'Renewed']),
});
export type Loan = z.infer<typeof LoanSchema>;
