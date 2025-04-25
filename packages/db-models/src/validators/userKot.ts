import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


const userKotSchema = z.object({
  _id: z.string().optional(),
  tableName: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  phone: z.string().min(10).max(10),
  name: z.string().min(1).max(50),
  cart: z.array(z.object({})).default([]),
  isSettle: z.boolean().default(false),
  date: z.number(),
});

export type UserKotType = z.infer<typeof userKotSchema>;
