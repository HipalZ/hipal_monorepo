import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const billSummary = z.object({
  businessId: ObjectIdSchema,
  totalSales: z.number().default(0),
  totalOnlineSales: z.number().default(0),
  totalOfflineSales: z.number().default(0),
});

export type BillSummary = z.infer<typeof billSummary>;
