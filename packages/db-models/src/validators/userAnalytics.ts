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

export const UserAnalyticsAttrs = z.object({
  userId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  visitCount: z.number({
    message: "visit is required",
  }),
  totalSpend: z.number({
    message: "totalSpend is required",
  }),
  avgSpend: z.number({
    message: "avgSpend is required",
  }),
  coinzIssued: z
    .number({
      message: "coinzIssued is required",
    })
    .optional(),

  coinzUsed: z
    .number({
      message: "coinzIssued is required",
    })
    .optional(),

  dateOfJoining: z
    .number({
      message: "dateOfJoining is required",
    })
    .optional(),

  tableName: z.string().optional(),
  currentCoins: z.number().optional(),
  couponCount: z.number().optional(),
  tagIds: z.array(ObjectIdSchema).optional(),
  dob: z.number().optional(),
});

export type UserAnalytics = z.infer<typeof UserAnalyticsAttrs>;
