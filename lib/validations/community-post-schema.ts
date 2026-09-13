import { z } from 'zod';

export const communityPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(150, 'Title cannot exceed 150 characters'),
  body: z
    .string()
    .trim()
    .min(5, 'Content must be at least 5 characters long')
    .max(5000, 'Content cannot exceed 5000 characters'),
});

export type CommunityPostFormValues = z.infer<typeof communityPostSchema>;
