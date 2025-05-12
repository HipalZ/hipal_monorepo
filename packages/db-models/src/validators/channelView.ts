import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const ChannelViewSchema = z.object({
  channelId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  viewCount: z.number(),
});

export type ChannelViewType = z.infer<typeof ChannelViewSchema>;
