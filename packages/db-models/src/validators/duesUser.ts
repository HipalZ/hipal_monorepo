import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const duesUserSchema = z.object({
  userId: ObjectIdSchema,
  totalDuesAmount: z.coerce.number().default(0),
  businessId: ObjectIdSchema,
});

export type DuesUserType = z.infer<typeof duesUserSchema>;
