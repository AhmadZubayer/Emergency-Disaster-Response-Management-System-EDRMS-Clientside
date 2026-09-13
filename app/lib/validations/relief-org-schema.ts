import { z } from 'zod';

export const reliefOrgSchema = z.object({
  organization_name: z
    .string()
    .trim()
    .min(3, 'Organization name must be at least 3 characters'),
  registration_number: z
    .string()
    .trim()
    .min(3, 'Official registration number is required'),
  organization_type: z
    .string()
    .trim()
    .min(1, 'Please select organization type'),
  address: z
    .string()
    .trim()
    .min(5, 'Address is required (at least 5 characters)'),
  contact_email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  contact_phone: z
    .string()
    .trim()
    .min(6, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .url('Please enter a valid URL (e.g. https://organization.org)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .trim()
    .optional(),
});

export type ReliefOrgFormData = z.infer<typeof reliefOrgSchema>;
