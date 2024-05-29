import { z } from "zod";

const AlertAttrs = z.object({
  businessId: z.string(),
  zoneId: z.string().optional(),
  tableName: z.string().optional(),
  tableId: z.string().optional(),
  staffId: z.string().optional(),
  status: z.string().optional(),
  time: z.string().optional(),
  message: z.string().optional(),
  kotId: z.string().default(""),
  isAlertOn: z.boolean().default(true),
  razorpayPaymentId: z.string().default(""),
  razorpayOrderId: z.string().default(""),
  razorpayAcquirerData: z.record(z.unknown()).default({}),
  mode: z.string().default(""),
  razorpayEventId: z.string().default(""),
});

export type AlertType = z.infer<typeof AlertAttrs>;