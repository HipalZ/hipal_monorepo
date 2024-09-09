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

export const GoogleAuthUsersAttrs = z.object({
  businessId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  userId: ObjectIdSchema,
  authorName: z.string().min(1).max(100),
});

export type GoogleAuthUserType = z.infer<typeof GoogleAuthUsersAttrs>;
