import z from 'zod';

export const RewardsSchema = z.object({
  claimedCoins: z.coerce.number(),
  loyaltyId: z.string(),
  userPhone: z.string(),
});

export type RewardsType = z.infer<typeof RewardsSchema>;
