import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const WhatsappWABASchema = z.object({
  displayName: z.string().min(2).max(2000),
  displayNumber: z.string().min(2).max(2000),
  email: z.string().email().optional(),
  facebookId: z.string().min(2).max(2000).optional(),
  facebookPassword: z.string().min(2).max(2000).optional(),
  businessId: ObjectIdSchema,
  status: z.boolean().default(false),
  date: z.number().default(Date.now()),
});

export type WhatsappWABAType = z.infer<typeof WhatsappWABASchema>;
