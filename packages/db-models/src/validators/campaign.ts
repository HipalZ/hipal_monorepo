import { z } from "zod";
import { ObjectIdSchema } from "./common";

const campaignSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.string().min(1).max(70),
  campaignName: z.string().min(1).max(70),
  description: z.string().min(1).max(70).optional(),
  isActive: z.boolean().default(true),

  date: z.number(),
});

export type CampaignType = z.infer<typeof campaignSchema>;
