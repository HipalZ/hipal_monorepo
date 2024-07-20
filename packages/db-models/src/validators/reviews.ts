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
export const ReviewsSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  reviewRating: z.coerce
    .number({
      message: "Review rating must be a number",
    })
    .min(1, {
      message: "Review rating must be greater than 0",
    })
    .max(5, {
      message: "Review rating must be less than 6",
    })
    .optional(),
  foodTaste: z.coerce
    .number({
      message: "Food taste must be a number",
    })
    .optional(),
  ambience: z.coerce
    .number({
      message: "Ambience must be a number",
    })
    .optional(),
  hygiene: z.coerce
    .number({
      message: "Hygiene must be a number",
    })
    .optional(),
  service: z.coerce
    .number({
      message: "Service must be a number",
    })
    .optional(),
  staffs: z.array(z.string()).optional(),
  description: z.string().min(4).max(200).optional(),
  improvementAreas: z
    .array(
      z
        .string({
          message: "Improvement area must be a string",
        })
        .min(10, {
          message: "Improvement area must be at least 10 characters",
        })
        .max(100, {
          message: "Improvement area must be at most 100 characters",
        }),
    )
    .optional(),
  date: z.coerce.number(),
  order_id: ObjectIdSchema,
});

export type ReviewsType = z.infer<typeof ReviewsSchema>;
