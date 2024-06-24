import { z } from 'zod';

export const CustomerSchema = z.object({
  businessId: z.string(),
  name: z.string().optional(),
  phone: z.string(),
  count: z.coerce.number().min(0).default(0),
  date: z.coerce.number(),
});

export type CustomerType = z.infer<typeof CustomerSchema>;
