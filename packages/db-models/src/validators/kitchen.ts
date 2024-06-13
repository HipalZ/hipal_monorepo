import { z } from 'zod';

export const KitchenAttrs = z.object({
  businessId: z.string(),
  kitchenName: z.string(),
  description: z.string().optional(),
  staff: z.array(z.string()).optional(),
});

export type KitchenType = z.infer<typeof KitchenAttrs>;
