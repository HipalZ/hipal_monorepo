import { z } from "zod";
import { ObjectIdSchema } from "../common";
import { roomTypeEnum } from "./rooms";

export const hotelType = z.object({
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
  roomType: z.enum(roomTypeEnum),
  images: z.array(z.string().min(10).max(200)).optional().default([]),
  businessId: ObjectIdSchema,
  description: z.string().min(1).max(300).optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  pricePerNight: z.number().optional().default(0),
  size: z.string().max(100).optional(),
  capacity: z.number().optional().default(1),
  typeOfBed: z.string().max(100).optional(),
});

export const updateHotelType = z.object({
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
  roomType: z.enum(roomTypeEnum).optional(),
  images: z.array(z.string().min(10).max(200)).optional().default([]),
  description: z.string().min(1).max(300).optional(),
  roomIds: z.array(ObjectIdSchema).optional().default([]),
  pricePerNight: z.number().optional().default(0),
  roomTypeId: ObjectIdSchema,
});

export type HotelType = z.infer<typeof hotelType>;
