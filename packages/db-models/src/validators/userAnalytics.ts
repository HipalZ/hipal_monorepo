import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
