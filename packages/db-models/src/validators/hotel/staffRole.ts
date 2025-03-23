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

export const hotelStaffRoleEnum = [
  "MANAGER",
  "RECEPTIONIST",
  "HOUSEKEEPING",
  "MAINTENANCE",
  "SECURITY",
  "HELP_DESK",
  "CLEANER",
  "WAITER",
  "LAUNDRY",
  "KITCHEN",
  "ELECTRICIAN",
  "PLUMBER",
] as const;

export type HotelStaffRoleEnumType = (typeof hotelStaffRoleEnum)[number];

export const hotelStaffRole = z.object({
  role: z.enum(hotelStaffRoleEnum),
});

export const addHotelStaff = z.object({
  name: z.string().min(2).max(50),
  phone: z.string().min(10).max(10),
  businessId: z.string().min(2).max(50),
  serviceIds: z.array(ObjectIdSchema).optional(),
  role: z.enum(hotelStaffRoleEnum),
  nickName: z.string().min(2).max(50).optional(),
  password: z.string().min(4).max(50).optional(),
});

export const editHotelStaff = z.object({
  name: z.string().min(2).max(50).optional(),
  businessId: z.string().min(2).max(50),
  serviceIds: z.array(ObjectIdSchema).optional(),
  staffId: ObjectIdSchema,
  role: z.enum(hotelStaffRoleEnum).optional(),
  nickName: z.string().min(2).max(50).optional(),
  password: z.string().min(4).max(50).optional(),
});

export type HotelStaffRoleType = z.infer<typeof hotelStaffRole>;
export type AddHotelStaffType = z.infer<typeof addHotelStaff>;
