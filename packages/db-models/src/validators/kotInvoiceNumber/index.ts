import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const kotInvoiceNumberSchema = z.object({
  businessId: ObjectIdSchema,
  kotInvoiceNumber: z.number().positive(),
});

export type KotInvoiceNumberType = z.infer<typeof kotInvoiceNumberSchema>;
