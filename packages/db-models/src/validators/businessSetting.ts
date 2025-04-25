import { z } from "zod";

const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const RegisterType = [
  "LLP",
  "PVT LTD",
  "PUBLIC LTD",
  "SOLE PROPRIETORSHIP",
  "PARTNERSHIP",
  "OTHER",
] as const;

export const BusinessSettingsSchema = z.object({
  businessId: ObjectIdSchema,
  registerName: z.string().min(4).max(50).optional(),
  registerType: z.enum(RegisterType).optional(),
  establishmentYear: z.string().min(4).max(4).optional(),
  panNumber: z.string().min(10).max(10).optional(),
  gstNumber: z.string().min(15).max(15).optional(),
  bankName: z.string().min(4).max(50).optional(),
  accountNumber: z.string().min(10).max(20).optional(),
  ifscCode: z.string().min(4).max(20).optional(),
  branchName: z.string().min(4).max(50).optional(),
  beneficiaryName: z.string().min(4).max(50).optional(),
  razorpayMerchantId: z.string().min(4).max(100).optional(),
  razorpayKeyId: z.string().min(4).max(100).optional(),
  razorpayKeySecret: z.string().min(4).max(100).optional(),
  razorpayWebhookSecret: z.string().min(4).max(100).optional(),
  isActive: z.boolean().default(true).optional(),
});

export type BusinessSettingsType = z.infer<typeof BusinessSettingsSchema>;
