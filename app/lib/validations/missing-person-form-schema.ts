import { z } from 'zod';

export const missingPersonSchema = () =>
  z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    age: z
      .string()
      .min(1, 'Age is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Enter a valid age',
      }),
    gender: z.string().min(1, 'Gender is required'),
    lastSeenLocation: z.string().trim().min(1, 'Location is required'),
    lastSeenDate: z.string().min(1, 'Last seen date is required'),
    contactPhone: z.string().optional(),
    description: z.string().trim().min(1, 'Description is required'),
  });
