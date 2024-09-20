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

export const ChannelViewSchema = z.object({
  channelId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  viewCount: z.number(),
});

export type ChannelViewType = z.infer<typeof ChannelViewSchema>;
