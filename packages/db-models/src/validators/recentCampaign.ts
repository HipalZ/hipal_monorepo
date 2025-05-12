import { z } from "zod";
import { ObjectIdSchema } from "./common";

const recentCampaignSchema = z.object({
  businessId: ObjectIdSchema,
  campaignId: z.string().min(1).max(70),
  templateId: z.string().min(1).max(70),
});

export type RecentCampaignType = z.infer<typeof recentCampaignSchema>;
