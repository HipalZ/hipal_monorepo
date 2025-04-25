import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

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
