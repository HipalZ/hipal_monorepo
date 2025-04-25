import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


const tempTableSettleSchema = z.object({
  businessId: ObjectIdSchema,
  tableName: z.string().min(1).max(100),
  settleBy: z.string().min(1).max(100).optional(),
  createdAt: z.date().optional(),
  hiCode: z.string().min(1).max(100).optional(),
  pin: z.string().min(1).max(100).optional(),
});

export type TempTebleSettleType = z.infer<typeof tempTableSettleSchema>;
