import { z } from 'zod';

export const volunteerRegistrationSchema = z.object({
  skills: z.array(z.string()).min(1, 'Select at least one rescue skill'),
  why_join: z
    .string()
    .trim()
    .min(10, 'Please explain why you want to volunteer in at least 10 characters'),
  available: z.boolean(),
});

export const volunteerProfileUpdateSchema = z.object({
  skills: z.array(z.string()).min(1, 'Select at least one rescue skill'),
  available: z.boolean(),
});
