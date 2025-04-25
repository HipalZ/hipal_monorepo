import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });

export const hotelAmenities = z.object({
  name: z.string().min(1).max(50),
  image: z.string().url().min(5).max(50),
});

export type HotelAmenitiesType = z.infer<typeof hotelAmenities>;
