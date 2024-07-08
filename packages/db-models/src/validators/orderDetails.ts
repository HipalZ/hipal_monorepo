import mongoose from 'mongoose';
import z from 'zod';
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: 'Invalid ObjectId',
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const OrderDetailsSchema = z.object({
  order_id: ObjectIdSchema,
  payment_id: ObjectIdSchema,
  date: z.number(),
});

export type OrderDetailsType = z.infer<typeof OrderDetailsSchema>;
