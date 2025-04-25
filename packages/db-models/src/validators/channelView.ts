import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const ChannelViewSchema = z.object({
  channelId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  viewCount: z.number(),
});

export type ChannelViewType = z.infer<typeof ChannelViewSchema>;
