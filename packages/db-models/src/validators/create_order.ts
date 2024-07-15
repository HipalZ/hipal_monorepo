import { z } from 'zod';

export const orderSchema = z.object({
  businessId: z.string().min(1),
  total: z.coerce.number().optional(),
  billValue: z.coerce.number().positive().optional(),
  claimedCoins: z.coerce.number().default(0).optional(),
  tips: z.coerce.number().optional(),
  currency: z.string().min(1),
  userId: z.string().min(1),
  tableName: z.string().optional(),
  date: z.coerce.number().positive().optional(),
});

export type RazorpayOrderType = z.infer<typeof orderSchema>;
