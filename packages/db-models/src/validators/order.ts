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
  total: z.coerce.number().optional(),
  currency: z.string(),
  receipt: z.string(),
  name: z.string(),
  billValue: z.coerce.number(),
  phone: z.string(),
  tips: z.coerce.number().optional(),
  claimedCoins: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  businessId: ObjectIdSchema,
  order_id: z.string(),
  tableName: z.string().optional(),
  date: z.coerce.number().default(Date.now()),
});

export type OrderType = z.infer<typeof OrderSchema>;
