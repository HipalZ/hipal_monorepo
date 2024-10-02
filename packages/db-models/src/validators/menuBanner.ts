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
export const menuBannerSchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,

  startTime: z.coerce
    .number({
      message: "Start time is required",
    })
    .default(0),
  endTime: z.coerce
    .number({
      message: "End time is required",
    })
    .default(86400000),

  isPublished: z.boolean().default(true).optional(),
  heading: z
    .string()
    .min(3, {
      message: "Heading should be at least 3 characters",
    })
    .max(100, {
      message: "Heading should be at most 100 characters",
    }),
  dishIds: z
    .array(ObjectIdSchema)
    .min(1, {
      message: "Dish Ids are required",
    })
    .max(15, {
      message: "Dish Ids should be at most 10",
    })
    .default([]),
  isDeleted: z.boolean().default(false).optional(),
});

export type MenuBannerType = z.infer<typeof menuBannerSchema>;
