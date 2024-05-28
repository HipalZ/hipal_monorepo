import { z } from 'zod';

export const loyaltySchema = z.object({
  businessId: z.string(),
  loyaltyId: z.string().optional(),
  setReward: z.number().optional(),
  setClaimAmount: z.number().optional(),
  password: z.string().optional(),
  origin: z.boolean().optional(),
  cardPattern: z.string().optional(),
  cardColor: z.string().optional(),
  fontColor: z.string().optional(),
  logo: z.string().optional(),
  expiryDate: z.string().optional(),
  rewardLimit: z.number().optional(),
});

export type Loyalty = z.infer<typeof loyaltySchema>;