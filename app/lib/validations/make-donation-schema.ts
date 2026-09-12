import { z } from 'zod';

export const makeDonationSchema = (maxAmount: number, isAnonymous: boolean) =>
  z.object({
    amount: z
      .number()
      .min(1, 'Amount must be at least $1')
      .max(maxAmount, `Amount cannot exceed target goal of $${maxAmount.toLocaleString()}`),
    donorName: isAnonymous
      ? z.string().optional()
      : z.string().trim().min(1, 'Name is required'),
    donorEmail: isAnonymous
      ? z.string().optional()
      : z.string().trim().email('Enter a valid email address'),
  });
