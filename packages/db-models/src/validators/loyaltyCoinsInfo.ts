import z from 'zod';

export const LoyaltyCoinsInfoSchema = z.object({
  businessId: z.string(),
  coinzIssued: z.coerce.number(),
  coinzRedeemed: z.coerce.number(),
  couponzIssued: z.coerce.number().optional(),
  couponzRedeemed: z.coerce.number().optional(),
});

export type LoyaltyCoinsInfoType = z.infer<typeof LoyaltyCoinsInfoSchema>;
