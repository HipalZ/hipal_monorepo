import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const mergeAndSplitBillInvoiceCounterSchema = z.object({
  businessId: ObjectIdSchema,
  billInvoice: z.number(),
});

export type MergeAndSplitBillInvoiceCounterType = z.infer<
  typeof mergeAndSplitBillInvoiceCounterSchema
>;
