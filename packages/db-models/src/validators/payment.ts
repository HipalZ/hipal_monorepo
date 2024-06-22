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
export const PaymentSchema = z.object({
  businessId: ObjectIdSchema,
  total: z.coerce.number().positive(),
  billValue: z.coerce.number().positive(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  mode: z.string(),
  paymentMode: z.string(),
  tableName: z.string().optional(),
  claimedCoins: z.coerce.number().optional(),
  tips: z.coerce.number().default(0),
  order_id: ObjectIdSchema,
  date: z.coerce.number().default(Date.now()),
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayAcquirerData: z.any().optional(),
  razorpayEventId: z.string().optional(),
  paymentIds: z.array(z.string()).optional(),
  comment: z.string().optional(),
});

export type PaymentType = z.infer<typeof PaymentSchema>;
// export type PaymentItemType = z.infer<typeof Item>;
// export type PaymentSwiggyBillObjType = z.infer<typeof SwiggyBillObj>;
