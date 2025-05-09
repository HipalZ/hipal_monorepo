import { z } from "zod";

export const hotelAmenities = z.object({
  name: z.string().min(1).max(50),
  image: z.string().url().min(5).max(50),
});

export type HotelAmenitiesType = z.infer<typeof hotelAmenities>;
