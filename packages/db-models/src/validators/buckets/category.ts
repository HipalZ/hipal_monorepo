import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

// Example usage:
const ZoneValidator = z.object({
  _id: ObjectIdSchema,
  // …other fields...
});


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
