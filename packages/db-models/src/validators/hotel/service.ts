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

export const hotelService = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(50).optional(),
});

export const updateHotelService = z.object({
  name: z.string().min(1).max(50).optional(),
  serviceId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(50).optional(),
});

export type HotelServiceType = z.infer<typeof hotelService>;
