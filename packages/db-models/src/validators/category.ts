import mongoose from 'mongoose';
import { z } from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);
export const categorySchema = z.object({
  _id: ObjectIdSchema.optional(),
  businessId: ObjectIdSchema,
  name: z.string().min(3).max(100),
  visibility: z.boolean(),
  timerOn: z.boolean().optional(),
  timerStart: z.string().min(3).max(50).optional(),
  timerEnd: z.string().min(3).max(50).optional(),
  availableDays: z.array(z.coerce.number()),
  hierarchy: z.enum(['PARENT', 'CHILD']),
  parentCategory: z.string().max(100).optional().default(''),
  parentCategoryId: z.string().max(100).optional().default(''),
  coverImage: z.string().url().max(100).optional(),
  links: z.array(z.string().min(3).max(100)).optional(),
  dishes: z.array(ObjectIdSchema).optional().default([]),
  availability: z.boolean().default(true),
});

export type CategoryType = z.infer<typeof categorySchema>;
