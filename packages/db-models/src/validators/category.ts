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
  businessId: ObjectIdSchema,
  name: z.string().max(100),
  visibility: z.boolean(),
  timerOn: z.boolean().optional(),
  timerStart: z.string().optional(),
  timerEnd: z.string().optional(),
  availableDays: z.array(z.coerce.number()),
  hierarchy: z.enum(['PARENT', 'CHILD']),
  parentCategory: z.string().optional().default(''),
  parentCategoryId: z.string().optional().default(''),
  coverImage: z.string().url().optional(),
  links: z.array(z.string()).optional(),
  dishes: z.array(ObjectIdSchema).optional().default([]),
  version: z.coerce.number().optional(),
  availability: z.boolean().default(true),
  charges: z.array(z.unknown()).optional(),
});

export type CategoryType = z.infer<typeof categorySchema>;
