import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const staffLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const hotelStaffLevel = z.object({
  level: staffLevelSchema.default(1),
  nextLevelTime: z.number().min(1).max(20).default(5),
  staffIds: z.array(ObjectIdSchema),
  businessId: ObjectIdSchema,
});

export const updateHotelStaffLevel = z.object({
  levelId: ObjectIdSchema,
  level: staffLevelSchema.optional(),
  nextLevelTime: z.number().min(1).max(20).optional(),
  staffIds: z.array(ObjectIdSchema).optional(),
  businessId: ObjectIdSchema,
});

export type HotelStaffLevelType = z.infer<typeof hotelStaffLevel>;
