import { z } from "zod";
import { ObjectIdSchema } from "../common";

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
