import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
