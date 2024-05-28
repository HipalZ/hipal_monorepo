import { z } from "zod";

export const categorySchema = z.object({
  businessId: z.string(),
});

export type CategoryType = z.infer<typeof categorySchema>;
