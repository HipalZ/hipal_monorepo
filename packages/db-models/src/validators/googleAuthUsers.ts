import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const GoogleAuthUsersAttrs = z.object({
  businessId: ObjectIdSchema,
  loyaltyId: ObjectIdSchema,
  userId: ObjectIdSchema,
  authorName: z.string().min(1).max(100),
});

export const GoogleReviewsAttr = z.object({
  loyaltyId: ObjectIdSchema,
  userId: ObjectIdSchema,
});

export type GoogleAuthUserType = z.infer<typeof GoogleAuthUsersAttrs>;
