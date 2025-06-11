import { z } from "zod";

import { ObjectIdSchema } from "../common";

export const posDishConfig = z.object({
  description: z.boolean().optional().default(true),
  images: z.boolean().optional().default(true),
  visibility: z.boolean().optional().default(true),
  recommendationIds: z.boolean().optional().default(true),
  availabilty: z.boolean().optional().default(true),
  businessId: ObjectIdSchema,
});

export type PosDishConfigValidator = z.infer<typeof posDishConfig>;
