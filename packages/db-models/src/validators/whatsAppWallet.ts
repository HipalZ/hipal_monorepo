import z from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const whatsAppWalletSchema = z.object({
  businessId: ObjectIdSchema,
  currentBalance: z.number().default(0),

  date: z.number().default(Date.now()),
});

export type WhatsAppWalletType = z.infer<typeof whatsAppWalletSchema>;
