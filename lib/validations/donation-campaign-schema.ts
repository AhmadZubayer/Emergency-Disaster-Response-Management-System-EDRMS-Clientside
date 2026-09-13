import { z } from 'zod';

export const donationCampaignSchema = () =>
  z.object({
    title: z.string().trim().min(1, 'Campaign title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    targetAmount: z.number().min(1, 'Target amount must be at least 1'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  });

