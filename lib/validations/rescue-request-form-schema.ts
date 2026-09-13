import { z } from 'zod';

export const rescueRequestSchema = () =>
  z.object({
    latitude: z
      .string()
      .min(1, 'Latitude is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90, {
        message: 'Enter a valid latitude (-90 to 90)',
      }),
    longitude: z
      .string()
      .min(1, 'Longitude is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180, {
        message: 'Enter a valid longitude (-180 to 180)',
      }),
    description: z.string().trim().min(1, 'Description is required'),
    contactPhone: z.string().trim().min(1, 'Contact phone is required'),
    address: z.string().trim().optional(),
    peopleCount: z
      .string()
      .min(1, 'People count is required')
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
        message: 'Must be at least 1 person',
      }),
    urgencyLevel: z.string().min(1, 'Urgency level is required'),
    medicalNotes: z.string().trim().optional(),
  });
