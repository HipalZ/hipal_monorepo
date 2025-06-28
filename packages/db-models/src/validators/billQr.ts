import { z } from "zod";
import { ObjectIdSchema } from "./common";

const qrBillOrderSchema = z.object({
  billId: ObjectIdSchema,
  
  status: z
    .enum(["PENDING", "SUCCESS", "FAILED", "EXPIRED"])
    .default("PENDING"),

  date: z.number(),
  
});

export type QrBillOrderType = z.infer<typeof qrBillOrderSchema>;
