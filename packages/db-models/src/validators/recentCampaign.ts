import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


const recentCampaignSchema = z.object({
  businessId: ObjectIdSchema,
  campaignId: z.string().min(1).max(70),
  templateId: z.string().min(1).max(70),
});

export type RecentCampaignType = z.infer<typeof recentCampaignSchema>;
