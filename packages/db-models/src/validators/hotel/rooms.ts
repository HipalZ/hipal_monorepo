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
  capacity: z.coerce.number().default(0).optional(),
  roomStatus: z.enum(hotelStatusEnum).optional().default("AVAILABLE"),
  date: z.number().optional(),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
  authCode: z.string().min(4).max(4).optional(),
  rating: z.number().optional().default(4.5),
  size: z.string().min(1).max(50).optional(),
  description: z.string().min(1).max(300).optional(),
  images: z.array(z.string().min(10).max(200)).optional().default([]),
  downLoadLink: z.string().min(1).max(100).optional(),
  userIds: z.array(ObjectIdSchema).optional().default([]),
  slug: z.string().min(1).max(50).optional(),
  roomTypeId: ObjectIdSchema,
  isDeleted: z.boolean().optional().default(false),
  source: z.string().min(1).max(50).optional(),
});

export const hotelRoomCheckIn = z.object({
  roomId: ObjectIdSchema,
  name: z.string().min(1).max(50),
  phone: z.string().min(10).max(10),
  source: z.string().min(1).max(50).optional(),
});

export const hotelRoomCheckOut = z.object({
  roomId: ObjectIdSchema,
  userIds: z.array(ObjectIdSchema).optional().default([]),
});

export const hotelRoomSession = z.object({
  roomId: ObjectIdSchema,
  name: z.string().min(1).max(50),
  userIds: z.array(ObjectIdSchema).optional().default([]),
  date: z.number().optional(),
  checkIn: z.number().optional(),
  checkOut: z.number().optional(),
  authCode: z.string().min(4).max(4).optional(),
  isAuthCodeVerified: z.boolean().optional().default(false),
  source: z.string().optional(),
});

export const updateHotelRoom = z.object({
  name: z.string().min(1).max(50).optional(),
  tax: z.number().optional(),
  zoneId: ObjectIdSchema.optional(),
  roomId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  amenities: z.array(ObjectIdSchema).optional().default([]),
  capacity: z.coerce.number().default(0).optional(),
  roomStatus: z.enum(hotelStatusEnum).optional().default("AVAILABLE"),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
  description: z.string().min(1).max(300).optional(),
  images: z.array(z.string().min(10).max(200)).optional().default([]),
  size: z.string().min(1).max(50).optional(),
  roomTypeId: ObjectIdSchema.optional(),
  isDeleted: z.boolean().optional().default(false),
});

export const bulkHotelRoom = z.object({
  name: z.string().min(1).max(50),
  zoneId: ObjectIdSchema,
  capacity: z.coerce.number().default(0).optional(),
  staffIds: z.array(ObjectIdSchema).optional().default([]),
  roomTypeId: ObjectIdSchema,
});

export type HotelRoomType = z.infer<typeof hotelRoom>;
export type HotelRoomCheckInType = z.infer<typeof hotelRoomCheckIn>;
export type HotelRoomSessionType = z.infer<typeof hotelRoomSession>;
