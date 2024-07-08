import { z } from 'zod';

export const DuesSchema = z.object({
  businessId: z.string().optional(),
  duesPersonNames: z.string().optional(),
});

export type DuesType = z.infer<typeof DuesSchema>;
