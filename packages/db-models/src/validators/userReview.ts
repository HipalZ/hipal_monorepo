import { z } from 'zod';

export const ReviewSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
  keyword: z.string(),
  rating: z.string(),
  comment: z.string(),
  dateTime: z.string(),
  reviewerName: z.string(),
  description: z.string(),
  satisfactionRating: z.string(),
  mostLiked: z.array(z.string()),
  foodRating: z.string(),
  waiterRating: z.string(),
  businessLogo: z.string(),
  businessName: z.string(),
});

export type Review = z.infer<typeof ReviewSchema>;
