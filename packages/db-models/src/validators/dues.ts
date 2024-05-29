import { z } from "zod";

const DuesAttrs = z.object({
  businessId: z.string().optional(),
  duesPersonNames: z.string().optional(),
});

export type DuesType = z.infer<typeof DuesAttrs>;
