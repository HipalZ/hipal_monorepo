import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const posBillSchema = z.object({
  billRequestId: z.string().min(3).max(200),
  items: z.array(z.object({})).default([]),
  billInfo: z.object({}).default({}),

  businessId: ObjectIdSchema,
  createdAt: z.date().optional(),
});

export type PosBillType = z.infer<typeof posBillSchema>;
