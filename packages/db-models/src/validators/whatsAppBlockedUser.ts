import { z } from "zod";

export const whatsAppBlockedUserSchema = z.object({
  phone: z.string().min(10).max(10),
});

export type WhatsAppBlockedUserType = z.infer<typeof whatsAppBlockedUserSchema>;
