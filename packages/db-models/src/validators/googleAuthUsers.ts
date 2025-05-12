import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
