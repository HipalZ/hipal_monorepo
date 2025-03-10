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

export const hotelZones = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(2).max(50),
  tax: z.number().optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  availability: z.boolean().optional().default(true),
  amenities: z.array(z.string()).optional().default([]),
});

export const updateHotelZones = z.object({
  zoneId: ObjectIdSchema,
  name: z.string().min(2).max(50).optional(),
  tax: z.number().optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  availability: z.boolean().optional().default(true),
  amenities: z.array(z.string()).optional().default([]),
});

export type HotelZonesType = z.infer<typeof hotelZones>;
