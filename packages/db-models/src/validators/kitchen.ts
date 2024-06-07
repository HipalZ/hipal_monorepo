import { z } from 'zod';

const KitchenAttrs = z.object({
  businessId: z.string(),
  kitchenName: z.string(),
  description: z.string(),
  staff: z.array(z.string()).optional(),
});

export type KitchenType = z.infer<typeof KitchenAttrs>;
