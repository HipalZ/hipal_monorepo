import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const billInvoiceNumberSchema = z.object({
  businessId: ObjectIdSchema,
  billInvoiceNumber: z.number().positive(),
});

export type BillInvoiceNumberType = z.infer<typeof billInvoiceNumberSchema>;
