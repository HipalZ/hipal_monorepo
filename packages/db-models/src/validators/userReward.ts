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
const UserRewardDoc = z.object({
  _id: z.string().optional(),
  userId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  rewards: z.coerce.number(),
  password: z.coerce.number(),
  scanCount: z.coerce.number(),
  date: z.number().optional(),
});

export type UserRewardType = z.infer<typeof UserRewardDoc>;
