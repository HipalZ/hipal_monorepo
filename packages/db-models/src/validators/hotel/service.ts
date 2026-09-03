import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const hotelServiceInstructionRule = z.object({
  condition: z.enum(["BEFORE_TIME", "AFTER_TIME"]),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
  message: z.string().trim().max(240),
});

export const hotelServiceBehavior = z
  .object({
    instructionEnabled: z.boolean().optional().default(false),
    instruction: z.string().trim().max(240).optional().default(""),
    instructionRules: z.array(hotelServiceInstructionRule).max(4).optional().default([]),
  })
  .optional()
  .default({
    instructionEnabled: false,
    instruction: "",
    instructionRules: [],
  });

export const hotelService = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  categoryId: ObjectIdSchema,
  avgCompletionTime: z.number().nonnegative().optional().default(4),
  avgAcceptanceTime: z.number().nonnegative().optional().default(2),
  avgDeliveryTime: z.number().nonnegative().optional().default(3),
  quantityLimit: z.number().int().min(1).max(20).optional().default(1),
  serviceBehavior: hotelServiceBehavior,
  sequence: z.number().optional().default(0),
  systemKey: z.string().optional(),
});

export const hotelServiceCategory = z.object({
  name: z.string().min(1).max(50),
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  serviceIds: z.array(ObjectIdSchema).optional(),
  sequence: z.number().optional().default(0),
  systemKey: z.string().optional(),
});

export const updateHotelService = z.object({
  name: z.string().min(1).max(50).optional(),
  serviceId: ObjectIdSchema,
  businessId: ObjectIdSchema,
  availability: z.boolean().optional().default(true),
  image: z.string().url().min(5).max(200).optional(),
  avgCompletionTime: z.number().nonnegative().optional(),
  avgAcceptanceTime: z.number().nonnegative().optional(),
  avgDeliveryTime: z.number().nonnegative().optional(),
  quantityLimit: z.number().int().min(1).max(20).optional(),
  serviceBehavior: hotelServiceBehavior.optional(),
  sequence: z.number().optional(),
});

export type HotelServiceType = z.infer<typeof hotelService>;
export type HotelServiceCategoryType = z.infer<typeof hotelServiceCategory>;
