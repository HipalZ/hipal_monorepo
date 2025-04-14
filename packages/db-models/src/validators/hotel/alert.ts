import mongoose from "mongoose";
import { z } from "zod";
import { dishSchema, portionSchema } from "../dish";
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.Schema.Types.ObjectId, {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

export const alertProgressEnum = [
  "CREATED",
  "ACCEPTED",
  "DELIVERED",
  "REJECTED",
  "WARNING",
  "ESCALATION",
  "NOT_DELIVERED",
  "RESOLVED",
] as const;

export type HotelAlertProgressEnumType = (typeof alertProgressEnum)[number];

const CartItemSchema = z.object({
  id: z.string().min(1),
  dish: dishSchema,
  portion: portionSchema.nullable(),
  extras: z
    .array(z.object({}), {
      message: "addOnIds is required",
    })
    .default([]),
  quantity: z.number().positive(),
});

export const hotelAlert = z.object({
  alertProgress: z.enum(alertProgressEnum).optional().default("CREATED"),
  serviceIds: z.array(ObjectIdSchema),
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  createdAt: z.number().optional(),
  acceptedAt: z.number().optional(),
  deliveredAt: z.number().optional(),
  rejectedAt: z.number().optional(),
  createdBy: ObjectIdSchema.optional(),
  acceptedBy: ObjectIdSchema.optional(),
  deliveredBy: ObjectIdSchema.optional(),
  rejectedBy: ObjectIdSchema.optional(),
  roomId: ObjectIdSchema,
  cart: z.array(z.object({})).optional(),
  roomChatComplainId: ObjectIdSchema.optional(),
  message: z.string().optional(),
});

export const acceptHotelAlert = z.object({
  alertId: ObjectIdSchema,
  userId: ObjectIdSchema,
  action: z.enum(alertProgressEnum),
});

export const updateAlertCart = z.object({
  alertId: ObjectIdSchema,
  cart: z.array(z.object({})),
});

export type HotelAlertType = z.infer<typeof hotelAlert>;
export type AcceptHotelAlertType = z.infer<typeof acceptHotelAlert>;
export type UpdateAlertCartType = z.infer<typeof updateAlertCart>;
