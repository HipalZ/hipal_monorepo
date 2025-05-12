import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const PaymentAlertSchema = z.object({
  businessId: ObjectIdSchema,
  comment: z.string().min(4).max(300).optional(),
  message: z.string().min(4).max(300).optional(),
  alertType: z.enum([
    "ONLINE",
    "OFFLINE",
    "WAITER",
    "FORCE_SETTLE",
    "NORMAL_SETTLE",
  ]),
  status: z.enum(["SUCCESS", "FAIL", "WAITER"]),
  order_id: ObjectIdSchema,
  errorReason: z.string().optional(),
  errorDescription: z.string().optional(),
  isAccepted: z.boolean().default(false).optional(),
  coinsApplied: z.boolean().default(false).optional(),
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(3, {
      message: "Table name must be at least 3 characters",
    })
    .max(100, {
      message: "Table name must be at most 100 characters",
    }),
  posDiscount: z.number().default(0).optional(),
  waiterName: z
    .string({
      message: "Waiter name must be a string",
    })
    .min(3, {
      message: "Waiter name must be at least 3 characters",
    })
    .max(100, {
      message: "Waiter name must be at most 100 characters",
    })
    .optional(),
  isRejected: z.boolean().default(false).optional(),
  date: z.number(),
  posBillRequestId: z.string().optional(),
  userId: ObjectIdSchema,
  hiCode: z.string().default("").optional(),
  mode: z.string().min(1).max(100).optional(),
  v: z.coerce.number().optional(),
  appUrl: z.string().min(10).max(50).optional(),
  updateFeature: z.array(z.string()).optional(),
});

export type PaymentAlertType = z.infer<typeof PaymentAlertSchema>;
