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
export const WaiterPaymentAlertSchema = z.object({
  businessId: ObjectIdSchema,

  tableName: z.string().optional(),
  message: z.string().optional(),

  alertType: z.enum(['ONLINE', 'OFFLINE', 'CALLING']),

  order_id: ObjectIdSchema,
  payment_id: ObjectIdSchema.optional(),
  isAccepted: z.boolean().default(false),

  date: z.number().default(Date.now()),
});

export type WaiterPaymentAlertType = z.infer<typeof WaiterPaymentAlertSchema>;
