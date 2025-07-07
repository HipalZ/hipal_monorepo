import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const unsettleTableSchema = z.object({
  businessId: ObjectIdSchema,
  restId: z.string().min(1).max(100),
  pin: z.string().min(1).max(100),
  tableName: z.string().min(1).max(100),
  total: z.number(),
  sync: z.boolean().default(false),
  requestId: z.string().min(1).max(100),
  date: z.number(),
});

export type UnsettleTableType = z.infer<typeof unsettleTableSchema>;
