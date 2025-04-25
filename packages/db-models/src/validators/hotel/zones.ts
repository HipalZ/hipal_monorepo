import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

export const hotelZones = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(2).max(50),
  tax: z.number().optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
});

export const updateHotelZones = z.object({
  zoneId: ObjectIdSchema,
  name: z.string().min(2).max(50).optional(),
  tax: z.number().optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
});

export type HotelZonesType = z.infer<typeof hotelZones>;
