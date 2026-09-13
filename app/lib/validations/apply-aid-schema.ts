import { z } from 'zod';

export const applyAidSchema = z.discriminatedUnion('paymentMode', [
  z.object({
    paymentMode: z.literal('bank'),
    reason: z
      .string()
      .min(10, 'Please enter at least 10 characters for your situation and loss details.')
      .max(2000, 'Details cannot exceed 2000 characters.'),
    bankName: z.string().min(2, 'Bank name is required.'),
    branchName: z.string().min(2, 'Branch name is required.'),
    bankAccountNo: z.string().min(4, 'Bank account number is required.'),
  }),
  z.object({
    paymentMode: z.literal('mfs'),
    reason: z
      .string()
      .min(10, 'Please enter at least 10 characters for your situation and loss details.')
      .max(2000, 'Details cannot exceed 2000 characters.'),
    accountPhoneNumber: z
      .string()
      .min(10, 'Valid MFS account phone number is required.')
      .regex(/^[0-9+-\s()]+$/, 'Enter a valid phone number.'),
  }),
]);

export type ApplyAidFormData = z.infer<typeof applyAidSchema>;
