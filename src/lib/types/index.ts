import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string().optional(),
  customerId: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  address: z.string().min(5, "Address is too short"),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const LoanItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Item name is required"),
  weight: z.union([
    z.string().transform(val => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    }),
    z.number()
  ]).refine(val => val > 0, "Weight must be positive"),
  purity: z.enum(['24', '22', '18', '14']),
  photo: z.string().nullable().optional(),
});
export type LoanItem = z.infer<typeof LoanItemSchema>;

export const LoanSchema = z.object({
  id: z.string().optional(),
  loanId: z.string().optional(),
  receiptNumber: z.string().optional(),
  customerId: z.string(),
  customerName: z.string(),
  loanItems: z.array(LoanItemSchema),
  goldRate: z.number().positive(),
  totalWeight: z.number(),
  estimatedValue: z.number(),
  loanAmount: z.number().positive(),
  loanDate: z.date(),
  status: z.enum(['Active', 'Closed', 'Auctioned', 'Renewed']),
  topUpAmount: z.number().optional(),
  lastTopUpDate: z.date().optional(),
});
export type Loan = z.infer<typeof LoanSchema>;
