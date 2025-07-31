import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const itemDiscountSchema = z.object({
  itemId: ObjectIdSchema,
  discount: z.number().default(0),
  date: z.number().default(Date.now()),
});

export type ItemDiscountTypeValidator = z.infer<typeof itemDiscountSchema>;
