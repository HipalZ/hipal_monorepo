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

const campaignSchema = z.object({
  businessId: ObjectIdSchema,
  templateId: z.string().min(1).max(70),
  campaignName: z.string().min(1).max(70),
  description: z.string().min(1).max(70).optional(),
  isActive: z.boolean().default(true),

  date: z.number(),
});

export type CampaignType = z.infer<typeof campaignSchema>;
