import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelAnlyticsType = z.object({
  businessId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  user: ObjectIdSchema.optional(),
  date: z.number(),
  source: z.string().min(1).max(100).optional().default("not-given"),
});

export type HotelAnalyticsType = z.infer<typeof hotelAnlyticsType>;
