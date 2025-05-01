import { z } from "zod";

import { ObjectIdSchema } from "../common";

export const posCardConfig = z.object({
  theme: z.boolean().optional().default(true),
  staff: z.boolean().optional().default(true),
  setting: z.boolean().optional().default(true),
  payment: z.boolean().optional().default(true),
  event: z.boolean().optional().default(true),
  explorePage: z.boolean().optional().default(true),
  zones: z.boolean().optional().default(true),
  pos: z.boolean().optional().default(true),
  thumbnailStrip: z.boolean().optional().default(true),
  loyalty: z.boolean().optional().default(true),
  couponz: z.boolean().optional().default(true),
  hipeople: z.boolean().optional().default(true),
  review: z.boolean().optional().default(true),
  whatsapp: z.boolean().optional().default(true),
  analytic: z.boolean().optional().default(true),
  businessId: ObjectIdSchema,
});

export type PosCardConfigValidator = z.infer<typeof posCardConfig>;
