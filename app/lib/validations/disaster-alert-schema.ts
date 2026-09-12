import { z } from 'zod';

export const disasterAlertSchema = () =>
  z.object({
    disasterName: z.string().trim().min(1, 'Disaster name is required'),
    impactedLocation: z.string().trim().min(1, 'Impacted location is required'),
    impactTime: z.string().min(1, 'Impact date and time is required'),
    type: z.enum([
      'cyclone',
      'flood',
      'flash_flood',
      'heavy_rain',
      'drought',
      'earthquake',
      'landslide',
      'wildfire',
      'tsunami',
      'heatwave',
      'cold_wave',
      'river_erosion',
      'storm_surge',
      'tornado',
      'avalanche',
    ], {
      message: 'Select a valid disaster type',
    }),
  });

