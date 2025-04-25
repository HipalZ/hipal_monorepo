import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

// Example usage:


export const imagesSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  tagIds: z.array(ObjectIdSchema).optional(),
  categoryBucketId: ObjectIdSchema,
  isDeleted: z.boolean().default(false),
  imageUrl: z.string().min(1).max(200).url(),
  businessId: ObjectIdSchema.optional(),
});

export const updateImagesSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  tagIds: z.array(ObjectIdSchema).optional(),
  isDeleted: z.boolean().default(false),
  imageId: ObjectIdSchema,
});

export type ImagesType = z.infer<typeof imagesSchema>;
