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

export const GoogleReviewAttrs = z.object({
  userId: ObjectIdSchema,
  businessId: ObjectIdSchema,

  rating: z
    .number({
      message: "Rating must be a number",
    })
    .min(1)
    .max(5),
  comment: z
    .string({
      message: "Comment must be a string",
    })
    .min(1, {
      message: "Comment must be at least 1 character long",
    })
    .max(500, {
      message: "Comment must be at most 500 characters long",
    }),
  profilePhotoUrl: z
    .string({
      message: "Profile photo url must be a string",
    })
    .url({
      message: "Profile photo url must be a valid url",
    }),

  authorName: z.string().min(1).max(100),
});

export type GoogleReviewType = z.infer<typeof GoogleReviewAttrs>;
