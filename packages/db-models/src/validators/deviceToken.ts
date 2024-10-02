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

export const deviceTokenSchema = z.object({
  tokens: z.array(z.string().min(1).max(700)),
  businessId: ObjectIdSchema,
});

export type DeviceTokenType = z.infer<typeof deviceTokenSchema>;
