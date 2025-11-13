import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const tableSessionCounterSchema = z.object({
  businessId: ObjectIdSchema,
  tableSessionId: z.string().min(1).max(50),
});

export type TableSessionCounterType = z.infer<typeof tableSessionCounterSchema>;
