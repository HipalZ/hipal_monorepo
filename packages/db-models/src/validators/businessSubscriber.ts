import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string({
      message: "Invalid ObjectId",
    })
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
export const businessSubscriberValidator = z.object({
  userId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  userCount: z
    .number({
      message: "userCount must be a number",
    })
    .optional(),
  isDeleted: z.boolean().default(false).optional(),
  date: z
    .number({
      message: "date must be a number",
    })
    .optional(),
});

export type BusinessSubscriber = z.infer<typeof businessSubscriberValidator>;
