import { z } from "zod";

export const acceptOrderSchema = z.object({
  comment: z.string().max(1000).optional(),
  waiterName: z.string().max(100).optional(),
  paymentModeId: z.string().max(100).optional(),
});

export type AcceptOrderType = z.infer<typeof acceptOrderSchema>;
