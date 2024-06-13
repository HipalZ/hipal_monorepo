import { z } from 'zod';

const Items = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string().optional(),
  visibility: z.boolean(),
  maxQuantity: z.number(),
  extraType: z.string().optional(),
  id: z.string(),
});

export const ExtraAttrs = z.object({
  businessId: z.string(),
  name: z.string(),
  numOptions: z.number(),
  numSelections: z.number(),
  compulsory: z.number(),
  maxQuantity: z.number(),
  addOnType: z.string().optional(),
  items: z.array(Items),
});

export type ExtraType = z.infer<typeof ExtraAttrs>;
export type ItemsType = z.infer<typeof Items>;
