import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const posBillSchema = z.object({
  billRequestId: z.string().min(3).max(200),
  items: z.array(z.object({})).default([]),
  billInfo: z.object({}).default({}),

  businessId: ObjectIdSchema,
  createdAt: z.date().optional(),
});

export type PosBillType = z.infer<typeof posBillSchema>;
