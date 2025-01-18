import { z } from "zod";

export const acceptOrderSchema = z.object({
  comment: z.string().max(1000).optional(),
  waiterName: z.string().max(100).optional(),
  paymentModeId: z.string().max(100).optional(),
  splitModes: z
    .array(
      z.object({
        name: z.string().max(100),
        amount: z.coerce.number().positive(),
        _id: z.string().max(100),
      }),
    )
    .default([])
    .optional(),

  split: z.boolean().default(false).optional(),
});

export type AcceptOrderType = z.infer<typeof acceptOrderSchema>;
