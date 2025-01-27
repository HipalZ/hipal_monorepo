import { z } from "zod";

export const acceptOrderSchema = z.object({
  comment: z.string().max(1000).optional(),
  waiterName: z.string().max(100).optional(),
  settleModes: z
    .array(
      z.object({
        name: z.string().max(100),
        amount: z.coerce.number().positive(),
        _id: z.string().max(100),
      }),
    )
    .min(1)
    .optional(),

  split: z.boolean().default(false).optional(),
  duesUserId: z.string().max(100).optional(),
});

export type AcceptOrderType = z.infer<typeof acceptOrderSchema>;
