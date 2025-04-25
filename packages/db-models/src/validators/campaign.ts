import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



const campaignSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.string().min(1).max(70),
  campaignName: z.string().min(1).max(70),
  description: z.string().min(1).max(70).optional(),
  isActive: z.boolean().default(true),

  date: z.number(),
});

export type CampaignType = z.infer<typeof campaignSchema>;
