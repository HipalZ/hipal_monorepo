import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const WhatsAppChatSchema = z.object({
  userId: ObjectIdSchema,
  ownerId: ObjectIdSchema,
  message: z.string().min(2).max(2000),
  isOwner: z.boolean().default(false),
  businessId: ObjectIdSchema,
  date: z.number().optional(),
  isDeleted: z.boolean().default(false).optional(),
  createdAt: z.date().optional(),
  seen: z.boolean().default(false),
});

export type WhatsAppChatType = z.infer<typeof WhatsAppChatSchema>;
