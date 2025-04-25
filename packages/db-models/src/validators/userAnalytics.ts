import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



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
