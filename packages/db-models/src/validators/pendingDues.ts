import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const pendingDuesSchema = z.object({
  businessId: ObjectIdSchema,
  billId: ObjectIdSchema,
  duesUserId: ObjectIdSchema,
  isSettled: z.boolean().default(false),
  date: z.number(),
});

export type PendingDuesType = z.infer<typeof pendingDuesSchema>;
