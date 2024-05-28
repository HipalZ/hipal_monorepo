import { z } from 'zod';

export const UserTransactionSchema = z.object({
  userId: z.string(),
  businessId: z.string(),
  order_id: z.string(),
  date: z.string(),
  phone_number: z.string(),
  cart: z.record(z.any()),
  payment_mode: z.string(),
  status: z.boolean(),
  deliver_to: z.string(),
  totalWithoutTax: z.number(),
  OtherCharges: z.array(z.record(z.any())).optional(),
  totalAmount: z.number(),
  businessLogo: z.string().optional(),
  businessName: z.string().optional(),
});

export type UserTransaction = z.infer<typeof UserTransactionSchema>;