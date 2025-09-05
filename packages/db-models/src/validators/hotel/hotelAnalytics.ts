import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelAnlyticsType = z.object({
  businessId: ObjectIdSchema,
  roomId: ObjectIdSchema,
  user: ObjectIdSchema.optional(),
  checkIn: z.number().min(0),
  checkOut: z.number().min(0),
  guestUserIds: z.array(ObjectIdSchema).optional().default([]),
  source: z.string().min(1).max(100).optional().default("not-given"),
  reviewIds: z.array(ObjectIdSchema).optional().default([]),
  roomSessionId: ObjectIdSchema.optional(),
});

export type HotelAnalyticsType = z.infer<typeof hotelAnlyticsType>;
