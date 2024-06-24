import { z } from 'zod';

const Items = z.object({
  name: z.string(),
  price: z.coerce.number(),
  description: z.string().optional(),
  visibility: z.boolean(),
  maxQuantity: z.coerce.number(),
  extraType: z.string().optional(),
  id: z.string(),
});

export const ExtraAttrs = z.object({
  businessId: z.string(),
  name: z.string(),
  numOptions: z.coerce.number(),
  numSelections: z.coerce.number(),
  compulsory: z.coerce.number(),
  maxQuantity: z.coerce.number(),
  addOnType: z.string().optional(),
  items: z.array(Items),
});

export type ExtraType = z.infer<typeof ExtraAttrs>;
export type ItemsType = z.infer<typeof Items>;
