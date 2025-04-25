import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const duesUserSchema = z.object({
  userId: ObjectIdSchema,
  totalDuesAmount: z.coerce.number().default(0),
  businessId: ObjectIdSchema,
});

export type DuesUserType = z.infer<typeof duesUserSchema>;
