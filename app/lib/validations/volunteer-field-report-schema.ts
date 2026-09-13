import { z } from 'zod';

const coordinates = {
  latitude: z.number().min(-90, 'Latitude must be at least -90').max(90, 'Latitude must be at most 90'),
  longitude: z.number().min(-180, 'Longitude must be at least -180').max(180, 'Longitude must be at most 180'),
};

export const routeReportSchema = z.object({
  report_type: z.enum(['blocked_route', 'dangerous_route']),
  description: z.string().trim().min(5, 'Description must contain at least 5 characters'),
  ...coordinates,
});

export const shortageReportSchema = z.object({
  resource_name: z.string().trim().min(1, 'Resource name is required'),
  quantity_needed: z.number().int().min(1, 'Quantity must be at least 1'),
  description: z.string().trim().min(5, 'Description must contain at least 5 characters'),
  ...coordinates,
});
