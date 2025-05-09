import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const whatsAppPaymentSchema = z.object({
  businessId: ObjectIdSchema,
  total: z.coerce
    .number({
      message: "Total must be a number",
    })
    .default(0),
  billValue: z.coerce
    .number({
      message: "Bill value must be a number",
    })
    .positive(),
  userId: ObjectIdSchema,
  mode: z
    .string({
      message: "Mode must be a string",
    })
    .min(3)
    .max(100),
  paymentMode: z.string().min(3).max(100),

  order_id: ObjectIdSchema,
  date: z.coerce.number({
    message: " Date must be a number",
  }),
  razorpayPaymentId: z
    .string({
      message: "Payment id must be a string",
    })
    .min(3, {
      message: "Payment id must be at least 3 characters",
    })
    .max(200, {
      message: "Payment id must be at most 200 characters",
    })
    .optional(),
  razorpayOrderId: z
    .string({
      message: "Order id must be a string",
    })
    .min(3, {
      message: "Order id must be at least 3 characters",
    })
    .max(200)
    .optional(),
  razorpayAcquirerData: z.any().optional(),
  razorpayEventId: z
    .string({
      message: "Event id must be a string",
    })
    .min(3, {
      message: "Event id must be at least 3 characters",
    })
    .max(200, {
      message: "Event id must be at most 200 characters",
    })
    .optional(),
});

export type WhatsAppPaymentType = z.infer<typeof whatsAppPaymentSchema>;
