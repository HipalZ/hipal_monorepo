import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const pendingDuesSchema = z.object({
  businessId: ObjectIdSchema,
  billId: ObjectIdSchema,
  duesUserId: ObjectIdSchema,
  isSettled: z.boolean().default(false),
  date: z.number(),
});

export type PendingDuesType = z.infer<typeof pendingDuesSchema>;
