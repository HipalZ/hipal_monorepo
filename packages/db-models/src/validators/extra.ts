import { z } from "zod";

const Items = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  visibility: z.boolean(),
  maxQuantity: z.number(),
  extraType: z.string(),
  id: z.string(),
});

const ExtraAttrs = z.object({
  businessId: z.string(),
  name: z.string(),
  numOptions: z.number(),
  numSelections: z.number(),
  compulsory: z.number(),
  maxQuantity: z.number(),
  addOnType: z.string(),
  items: z.array(Items),
});

export type ExtraType = z.infer<typeof ExtraAttrs>;
