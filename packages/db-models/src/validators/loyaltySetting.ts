import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const CardPatternEnum = [
  "CARD_ONE",
  "CARD_TWO",
  "CARD_THREE",
  "CARD_FOUR",
  "CARD_FIVE",
  "CARD_SIX",
] as const;

export const CardLayoutEnum = [
  "LAYOUT_ONE",
  "LAYOUT_TWO",
  "LAYOUT_THREE",
] as const;

export type CardPatternType = (typeof CardPatternEnum)[number];

export type CardLayoutType = (typeof CardLayoutEnum)[number];

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
  cardType: z
    .enum(CardPatternEnum, {
      message:
        "cardPattern need to be one of CARD_ONE, CARD_TWO, CARD_THREE, CARD_FOUR, CARD_FIVE, CARD_SIX",
    })
    .optional(),

  cardLayout: z
    .enum(CardLayoutEnum, {
      message:
        "cardLayout need to be one of LAYOUT_ONE, LAYOUT_TWO, LAYOUT_THREE",
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
  rewardLimit: z.coerce
    .number({
      message: "rewardLimit need number",
    })
    .optional(),
  signUpBonus: z.coerce
    .number({
      message: "signUpBonus need number",
    })
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
  termAndCondition: z
    .string()
    .min(2, {
      message: "termAndCondition need min 2",
    })
    .max(500, {
      message: "termAndCondition need max 500",
    })
    .optional(),
  loyaltyStartDate: z.coerce.number({
    message: "loyaltyStartDate need timestamp",
  }),
});

export type LoyaltyType = z.infer<typeof loyaltySchema>;
