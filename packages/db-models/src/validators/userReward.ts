import { z } from 'zod';

const UserRewardDoc = z.object({
  userPhone: z.string(),
  userName: z.string(),
  loyaltyId: z.string(),
  rewards: z.coerce.number(),
  password: z.coerce.number(),
  scanCount: z.coerce.number(),
  date: z.coerce.number(),
  count: z.coerce.number(),
});

export type UserRewardType = z.infer<typeof UserRewardDoc>;
