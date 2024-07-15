import mongoose from 'mongoose';
import { z } from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const loyaltySchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  setCashBackPercentage: z.coerce.number(),
  setClaimedPercentage: z.coerce.number(),
  password: z.string().min(6).max(100),
  origin: z.boolean().optional(),
  cardPattern: z.string().optional(),
  cardColor: z.string().optional(),
  fontColor: z.string().optional(),
  logo: z.string().optional(),
  loyaltyExpiryDate: z.coerce.number(),
  rewardLimit: z.coerce.number(),
  signUpBonus: z.coerce.number().optional(),
});

export type LoyaltyType = z.infer<typeof loyaltySchema>;
