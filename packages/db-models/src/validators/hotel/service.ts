import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });
export const hotelService = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(50).optional(),
  categoryId: ObjectIdSchema,
  avgCompletionTime: z.number().optional().default(4),
  avgAcceptanceTime: z.number().optional().default(2),
  avgDeliveryTime: z.number().optional().default(3),
});

export const hotelServiceCategory = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(50).optional(),
  serviceIds: z.array(ObjectIdSchema).optional(),
});

export const updateHotelService = z.object({
  name: z.string().min(1).max(50).optional(),
  serviceId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(50).optional(),
});

export type HotelServiceType = z.infer<typeof hotelService>;
export type HotelServiceCategoryType = z.infer<typeof hotelServiceCategory>;
