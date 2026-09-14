import { z } from 'zod';

export const userProfileSchema = () =>
  z.object({
    name: z.string().trim().min(1, 'Name is required'),
    phone: z.string().trim().optional(),
    house: z.string().trim().optional(),
    city: z.string().trim().optional(),
    district: z.string().trim().optional(),
    country: z.string().trim().optional(),
    gps_lat: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= -90 && Number(val) <= 90),
        { message: 'Enter a valid latitude (-90 to 90)' }
      ),
    gps_lng: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= -180 && Number(val) <= 180),
        { message: 'Enter a valid longitude (-180 to 180)' }
      ),
    emergency_message: z.string().trim().optional(),
    medical_information: z.string().trim().optional(),
  });
