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
export const AnalyticSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  totalUserSpend: z.coerce
    .number({
      message: "Total user spend must be a number",
    })
    .default(0),
  avgUserSpend: z.coerce
    .number({
      message: "Average user spend must be a number",
    })
    .default(0),
  userCount: z.coerce
    .number({
      message: "User count must be a number",
    })
    .default(0),
  totalUserRatingSum: z.coerce
    .number({
      message: "Total user rating sum must be a number",
    })
    .default(0)
    .optional(),
  avgUserRating: z.coerce
    .number({
      message: "Average user rating must be a number",
    })
    .default(0)
    .optional(),
  userReviewCount: z.coerce
    .number({
      message: "User review count must be a number",
    })
    .default(0)
    .optional(),
  totalUserSpendForBusiness: z.coerce.number({
    message: "totalUserSpendForBusiness by user must be a number",
  }),
  avgUserSpendForBusiness: z.coerce.number({
    message: "avgUserSpendForBusiness spend by user must be a number",
  }),
  businessUserCount: z.coerce.number({
    message: "BusinessUser count must be a number",
  }),
  totalBusinessRatingSum: z.coerce
    .number({
      message: "Total business rating sum must be a number",
    })
    .default(0)
    .optional(),
  avgBusinessRating: z.coerce
    .number({
      message: "Average business rating must be a number",
    })
    .default(0)
    .optional(),
  businessReviewCount: z.coerce
    .number({
      message: "Business review count must be a number",
    })
    .default(0)
    .optional(),
  date: z.coerce.number(),
  dateOfJoiningOfUserForBusiness: z.coerce.number(),
});

export type AnalyticsType = z.infer<typeof AnalyticSchema>;
