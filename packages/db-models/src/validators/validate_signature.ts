import { z } from "zod";

export const validateSignatureSchema = z.object({
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(100),
});

export const validatePaymentSchema = z.object({
  response: validateSignatureSchema,
});

export type RazorpayType = z.infer<typeof validateSignatureSchema>;
