import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
