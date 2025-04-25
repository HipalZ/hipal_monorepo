import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


const UserRewardHistoryAttrs = z.object({
  userId: ObjectIdSchema,
  rewards: z.coerce.number(),
  status: z.enum(["MINUS", "PLUS"]),
  date: z.number(),
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(3, {
      message: "Table name must be at least 3 characters",
    })
    .max(100, {
      message: "Table name must be at most 100 characters",
    }),
  loyaltyId: ObjectIdSchema,
  order_id: ObjectIdSchema.optional(),
});

export type UserRewardHistoryType = z.infer<typeof UserRewardHistoryAttrs>;
