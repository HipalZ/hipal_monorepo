import mongoose from "mongoose";
import { z } from "zod";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

const recentCampaignSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.string().min(1).max(70),
});

export type RecentCampaignType = z.infer<typeof recentCampaignSchema>;
