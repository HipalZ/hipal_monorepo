import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


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
