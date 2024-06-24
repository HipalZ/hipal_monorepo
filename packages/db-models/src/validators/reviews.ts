import { z } from 'zod';

export const ReviewsSchema = z.object({
  businessId: z.string(),
  reviewerName: z.string().optional(),
  reviewerPhone: z.string(),
  reviewRating: z.coerce.number().min(1).max(5).optional(),
  description: z.string().optional(),
  improvementAreas: z.array(z.string()).optional(),
  date: z.coerce.number().optional(),
  order_id: z.string().optional(),
});

export type ReviewsType = z.infer<typeof ReviewsSchema>;
