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

export const PaymentAlertSchema = z.object({
  businessId: ObjectIdSchema,
  comment: z.string().optional(),
  message: z.string().optional(),
  alertType: z.enum(['ONLINE', 'OFFLINE', 'WAITER']),
  status: z.enum(['SUCCESS', 'FAIL', 'WAITER']),
  order_id: ObjectIdSchema.optional(),
  errorReason: z.string().optional(),
  errorDescription: z.string().optional(),
  payment_id: ObjectIdSchema.optional(),
  isAccepted: z.boolean().default(false).optional(),
  coinsApplied: z.boolean().default(false).optional(),
  completionCode: z.number().optional(),
  name: z.string().optional(),
  tableName: z.string(),
  waiterName: z.string().optional(),
  isRejected: z.boolean().default(false).optional(),
  date: z.number().default(Date.now()),
});

export type PaymentAlertType = z.infer<typeof PaymentAlertSchema>;
