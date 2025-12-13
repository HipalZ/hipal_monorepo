import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const tableSessionCounterSchema = z.object({
  businessId: ObjectIdSchema,
  tableSessionId: z.string().min(1).max(50),
  isMergeAfterSplit: z.boolean().default(false),
});

export type TableSessionCounterType = z.infer<typeof tableSessionCounterSchema>;
