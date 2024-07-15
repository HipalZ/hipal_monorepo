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
export const ReviewsSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  reviewRating: z.coerce.number().min(1).max(5).optional(),
  foodTaste: z.boolean().optional(),
  ambience: z.boolean().optional(),
  hygiene: z.boolean().optional(),
  service: z.boolean().optional(),
  staffs: z.array(z.string()).optional(),
  description: z.string().min(4).max(200).optional(),
  improvementAreas: z.array(z.string().min(10).max(100)).optional(),
  date: z.coerce.number(),
  order_id: ObjectIdSchema,
});

export type ReviewsType = z.infer<typeof ReviewsSchema>;
