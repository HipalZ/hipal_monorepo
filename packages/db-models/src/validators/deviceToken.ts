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
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  token: z.string().min(1).max(700),
  notification: z.boolean().default(true),
  v: z.coerce.number().optional(),
  appUrl: z.string().min(10).max(50).optional(),
});

export type DeviceTokenType = z.infer<typeof deviceTokenSchema>;
