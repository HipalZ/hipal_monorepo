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

export const hotelAmenities = z.object({
  name: z.string().min(1).max(50),
  image: z.string().url().min(5).max(50),
});

export type HotelAmenitiesType = z.infer<typeof hotelAmenities>;
