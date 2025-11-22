import { z } from "zod";

export const razorpayWebhookQueueModelValidator = z.object({
  razorpayEventId: z.string().min(1).max(100),
  order_id: z.string().min(1).max(100),
  id: z.string().min(1).max(100),
  event: z.string().min(1).max(100),
  merchantId: z.string().min(1).max(100),
  status: z.enum(["SUCCESS", "FAILED", "PROCESSING", "PENDING"]),
  date: z.number().optional(),
  error_description: z.string().optional(),
  error_reason: z.string().optional(),
  acquirer_data: z.object({}).optional(),
  mode: z.string(),
});

export type RazorpayWebhookQueueModelValidatorType = z.infer<
  typeof razorpayWebhookQueueModelValidator
>;
