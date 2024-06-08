import { z } from 'zod';

export const PaymentModeSchema = z.object({
  businessId: z.string().optional(),
  mode: z.string().optional(),
  commission: z.number().default(0),
});

export type PaymentModeType = z.infer<typeof PaymentModeSchema>;
