import { z } from 'zod';

export const volunteerGroupSchema = () =>
  z.object({
    title: z.string().trim().min(1, 'Group title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    location: z.string().trim().min(1, 'Location is required'),
    neededVolunteers: z.number().int().min(1, 'At least 1 volunteer is required'),
    disasterName: z.string().optional(),
    acceptingRequests: z.boolean(),
  });

