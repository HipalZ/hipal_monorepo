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
export const uniquelyYoursSchema = z.object({
  name: z.string().min(3).max(255),
  businessId: ObjectIdSchema,
  dishId: ObjectIdSchema,
  dishType: z.string().min(3).max(100),
  images: z.array(z.string().url().min(10).max(100)),
  isDeleted: z.boolean().default(false).optional(),
});

export type UniquelyYoursType = z.infer<typeof uniquelyYoursSchema>;
