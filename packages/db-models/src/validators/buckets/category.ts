import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const categoryBucketSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  businessId: ObjectIdSchema.optional(),
});

export const updateCategoryBucketSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  categoryBucketId: ObjectIdSchema,
});

export type CategoryBucketType = z.infer<typeof categoryBucketSchema>;
