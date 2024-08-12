import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const CardPatternEnum = [
  "BEANS",
  "LOVE",
  "FLOWER",
  "TRIANGLE",
  "BUD",
  "WAVE",
  "BOWL",
] as const;

export type CardPatternType = (typeof CardPatternEnum)[number];

export const loyaltySchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  setCashBackPercentage: z.coerce.number({
    message: "setCashBackPercentage need number and should be between 0-100",
  }),
  setClaimedPercentage: z.coerce.number({
    message: "setClaimedPercentage need number and should be between 0-100",
  }),
  password: z
    .string()
    .min(6, {
      message: "password need min 6",
    })
    .max(100, {
      message: "password need max 100",
    })
    .optional(),
  origin: z.boolean().optional(),
  cardPattern: z
    .enum(CardPatternEnum, {
      message:
        "cardPattern need to be one of BEANS, LOVE, FLOWER, TRIANGLE, BUD, WAVE, BOWL",
    })
    .optional(),
  cardColor: z
    .string()
    .min(2, {
      message: "cardColor need min 2",
    })
    .max(50, {
      message: "cardColor need max 50",
    })
    .optional(),
  fontColor: z
    .string()
    .min(2, {
      message: "fontColor need min 2",
    })
    .max(50, {
      message: "fontColor need max 50",
    })
    .optional(),
  logo: z
    .string()
    .min(10, {
      message: "logo need min 10",
    })
    .max(300, {
      message: "logo need max 300",
    })
    .url({
      message: "logo need url",
    })
    .optional(),
  loyaltyExpiryDate: z.coerce.number({
    message: "loyaltyExpiryDate need timestamp",
  }),
  rewardLimit: z.coerce.number({
    message: "rewardLimit need number",
  }),
  signUpBonus: z.coerce
    .number({
      message: "signUpBonus need number",
    })
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
});

export type LoyaltyType = z.infer<typeof loyaltySchema>;
