import { z } from 'zod';

export const orderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
});

export type RazorpayOrderType = z.infer<typeof orderSchema>;
