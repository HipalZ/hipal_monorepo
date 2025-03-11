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

export const roomTypeEnum = [
  "SINGLE",
  "DOUBLE",
  "TRIPLE",
  "QUAD",
  "SUITE",
  "DELUXE",
] as const;

export type HotelRoomEnumType = (typeof roomTypeEnum)[number];

export const hotelStatusEnum = [
  "AVAILABLE",
  "BOOKED",
  "OCCUPIED",
  "MAINTENANCE",
  "CLEANING",
  "RESERVED",
  "BLOCKED",
] as const;

export type HotelStatusEnumType = (typeof hotelStatusEnum)[number];

export const hotelRoom = z.object({
  businessId: ObjectIdSchema,
  name: z.string().min(1).max(50),
  tax: z.number().optional(),
  zoneId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
  roomType: z.enum(roomTypeEnum),
  pricePerNight: z.coerce.number().default(0).optional(),
  capacity: z.coerce.number().default(0).optional(),
  roomStatus: z.enum(hotelStatusEnum).optional().default("AVAILABLE"),
  date: z.number().optional(),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
  authCode: z.string().min(4).max(4).optional(),
  rating: z.number().optional().default(4.5),
  size: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(300).optional(),
  images: z.array(z.string().min(10).max(70)).optional().default([]),
  downLoadLink: z.string().min(1).max(100).optional(),
});

export const updateHotelRoom = z.object({
  name: z.string().min(1).max(50).optional(),
  tax: z.number().optional(),
  zoneId: ObjectIdSchema.optional(),
  roomId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
  roomType: z.enum(roomTypeEnum).optional(),
  pricePerNight: z.coerce.number().default(0).optional(),
  capacity: z.coerce.number().default(0).optional(),
  roomStatus: z.enum(hotelStatusEnum).optional().default("AVAILABLE"),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
  description: z.string().min(1).max(300).optional(),
  images: z.array(z.string().min(10).max(70)).optional().default([]),
  size: z.string().min(1).max(50).optional(),
});

export const bulkHotelRoom = z.object({
  name: z.string().min(1).max(50),
  zoneId: ObjectIdSchema,
  roomType: z.enum(roomTypeEnum),
  capacity: z.coerce.number().default(0).optional(),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
});

export type HotelRoomType = z.infer<typeof hotelRoom>;
