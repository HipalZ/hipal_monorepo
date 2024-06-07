import { z } from 'zod';

const CustomerAttrs = z.object({
  businessId: z.string(),
  name: z.string().optional(),
  phone: z.string(),
  count: z.number().min(0).default(0),
  date: z.number(),
});

export type CustomerType = z.infer<typeof CustomerAttrs>;
