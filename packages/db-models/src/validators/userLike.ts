import { z } from 'zod';

export const UserLikeSchema = z.object({
  businessId: z.string(),
  likes: z.array(z.string()),
});

export type UserLike = z.infer<typeof UserLikeSchema>;