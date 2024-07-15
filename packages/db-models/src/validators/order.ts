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
export const OrderSchema = z.object({
  total: z.coerce.number(),
  currency: z.string().min(3).max(3),
  receipt: z.string().min(3).max(100),
  billValue: z.coerce.number().positive(),
  userId: ObjectIdSchema,
  tips: z.coerce.number().optional(),
  claimedCoins: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  businessId: ObjectIdSchema,
  order_id: z.string(),
  tableName: z.string().optional(),
  date: z.coerce.number().optional(),
});

export type OrderType = z.infer<typeof OrderSchema>;
