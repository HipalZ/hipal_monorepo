import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const unsettleTableSchema = z.object({
  businessId: ObjectIdSchema,
  capacity: z.number().optional(),
  tableId: ObjectIdSchema,
  kotIds: z.array(ObjectIdSchema).default([]).optional(),
  status: z.enum(["ACTIVE"]).default("ACTIVE"),
  totalItemCount: z.number().default(0).optional(),
  userIds: z.array(ObjectIdSchema).default([]).optional(),
  currentTableAmount: z.number().default(0).optional(),
  date: z.number().optional(),
  isDeleted: z.boolean().default(false).optional(),
  performedBy: ObjectIdSchema.optional(),
});

export type UnsettleTableType = z.infer<typeof unsettleTableSchema>;
