import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const KitchenAttrs = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(2).max(50).trim(),
  description: z.string().min(3).max(100).optional(),
  staffIds: z.array(ObjectIdSchema).optional(),
  dishIds: z.array(ObjectIdSchema).optional(),
});

export const updateKitchenAttrs = z.object({
  kitchenId: ObjectIdSchema,
  name: z.string().min(2).max(50).trim().optional(),
  description: z.string().min(3).max(100).optional(),
  staffIds: z.array(ObjectIdSchema).optional(),
  dishIds: z.array(ObjectIdSchema).optional(),
});

export type KitchenType = z.infer<typeof KitchenAttrs>;
