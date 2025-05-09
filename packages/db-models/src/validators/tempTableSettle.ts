import { z } from "zod";
import { ObjectIdSchema } from "./common";

const tempTableSettleSchema = z.object({
  businessId: ObjectIdSchema,
  tableName: z.string().min(1).max(100),
  settleBy: z.string().min(1).max(100).optional(),
  createdAt: z.date().optional(),
  hiCode: z.string().min(1).max(100).optional(),
  pin: z.string().min(1).max(100).optional(),
});

export type TempTebleSettleType = z.infer<typeof tempTableSettleSchema>;
