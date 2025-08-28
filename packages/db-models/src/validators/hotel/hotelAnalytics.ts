import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelAnlyticsType = z.object({
  businessId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  userIds: z.array(ObjectIdSchema).optional().default([]),
  date: z.number(),
  source: z.string().min(1).max(100).optional().default("whatsapp"),
});

export type HotelAnalyticsType = z.infer<typeof hotelAnlyticsType>;
