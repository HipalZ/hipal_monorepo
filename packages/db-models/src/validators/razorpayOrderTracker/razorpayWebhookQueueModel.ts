import { z } from "zod";

export const razorpayWebhookQueueModelValidator = z.object({
  razorpayEventId: z.string().min(1).max(100),
  order_id: z.string().min(1).max(100),
  id: z.string().min(1).max(100),
  event: z.string().min(1).max(100),
  merchantId: z.string().min(1).max(100),
  status: z.enum(["SUCCESS", "FAILED", "PROCESSING", "PENDING"]),
  date: z.number().optional(),
});

export type RazorpayWebhookQueueModelValidatorType = z.infer<
  typeof razorpayWebhookQueueModelValidator
>;
