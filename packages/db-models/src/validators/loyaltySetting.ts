import { z } from 'zod';
const ObjectIdSchema = z.string().refine(
  (value) => {
    // Check if the value is a valid ObjectId
    return /^[a-f\d]{24}$/i.test(value);
  },
  {
    // Custom error message
    message: 'Invalid ObjectId',
  },
);

export const loyaltySchema = z.object({
  businessId: ObjectIdSchema,
  loyaltyId: z.string(),
  setReward: z.number(),
  setClaimAmount: z.number(),
  password: z.string(),
  origin: z.boolean().optional(),
  cardPattern: z.string().optional(),
  cardColor: z.string().optional(),
  fontColor: z.string().optional(),
  logo: z.string().optional(),
  expiryDate: z.string().optional(),
  loyaltyExpiryDate: z.number(),
  rewardLimit: z.number(),
  signUpBonus: z.number(),
});

export type LoyaltyType = z.infer<typeof loyaltySchema>;
