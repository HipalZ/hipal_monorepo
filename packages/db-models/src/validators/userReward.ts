import { z } from "zod";

const UserRewardDoc = z.object({
  userPhone: z.string(),
  userName: z.string(),
  loyaltyId: z.string(),
  rewards: z.number(),
  password: z.number(),
  scanCount: z.number(),
  date: z.number(),
  count: z.number(),
});

export type UserRewardType = z.infer<typeof UserRewardDoc>;
