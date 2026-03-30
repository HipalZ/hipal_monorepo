import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelService = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  categoryId: ObjectIdSchema,
  avgCompletionTime: z.number().optional().default(4),
  avgAcceptanceTime: z.number().optional().default(2),
  avgDeliveryTime: z.number().optional().default(3),
  sequence: z.number().optional().default(0),
});

export const hotelServiceCategory = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  serviceIds: z.array(ObjectIdSchema).optional(),
  sequence: z.number().optional().default(0),
});

export const updateHotelService = z.object({
  name: z.string().min(1).max(50).optional(),
  serviceId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  sequence: z.number().optional(),
});

export type HotelServiceType = z.infer<typeof hotelService>;
export type HotelServiceCategoryType = z.infer<typeof hotelServiceCategory>;
