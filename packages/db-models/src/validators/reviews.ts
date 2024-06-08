import { z } from 'zod';

export const ReviewsSchema = z.object({
  businessId: z.string(),
  reviewerName: z.string().optional(),
  reviewerPhone: z.string(),
  reviewRating: z.number().min(1).max(5),
  description: z.string().optional(),
  improvementAreas: z.array(z.string()).optional(),
  date: z.number(),
});

export type ReviewsType = z.infer<typeof ReviewsSchema>;
