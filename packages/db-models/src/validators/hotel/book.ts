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

export const bookRoomStatusEnum = [
  "BOOKED",
  "CANCELLED",
  "PENDING",
  "CHECKED_IN",
  "CHECKED_OUT",
] as const;

export type HotelBookRoomStatusEnumType = (typeof bookRoomStatusEnum)[number];

export const hotelRoomBooking = z.object({
  businessId: ObjectIdSchema,
  checkIn: z.number(),
  checkOut: z.number(),
  roomIds: z.array(ObjectIdSchema),
  userId: ObjectIdSchema,
  adults: z.number().min(1).max(30),
  children: z.number().min(0).max(10).optional().default(0),
  date: z.number().optional(),
  status: z.enum(bookRoomStatusEnum).optional().default("PENDING"),
});

export type HotelBookRoomType = z.infer<typeof hotelRoomBooking>;
