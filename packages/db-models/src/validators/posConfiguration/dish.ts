import { z } from "zod";

import { ObjectIdSchema } from "../common";

export const posDishConfig = z.object({
  description: z.boolean().optional().default(true),
  images: z.boolean().optional().default(true),
  visibility: z.boolean().optional().default(true),
  recommendationIds: z.boolean().optional().default(true),
  availabilty: z.boolean().optional().default(true),
  businessId: ObjectIdSchema,
  kitchenId: ObjectIdSchema,
  name: z.boolean().optional().default(true),
  price: z.boolean().optional().default(true),
  avgTime: z.boolean().optional().default(true),
  dishTypes: z.boolean().optional().default(true),
  categoryIds: z.boolean().optional().default(true),
  addOnIds: z.boolean().optional().default(true),
  tags: z.boolean().optional().default(true),
  portions: z.boolean().optional().default(true),
  calories: z.boolean().optional().default(true),
});

export type PosDishConfigValidator = z.infer<typeof posDishConfig>;
