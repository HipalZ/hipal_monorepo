import { z } from "zod";
import { ObjectIdSchema } from "../common";
import { dishSchema, portionSchema } from "../dish";

export const alertProgressEnum = [
  "CREATED",
  "ACCEPTED",
  "DELIVERED",
  "REJECTED",
  "IS_ACCEPTED_AND_WARNING", //
  "NON_ACCEPTED_AND_WARNING", //
  "IS_ACCEPTED_AND_ESCALATION",
  "NON_ACCEPTED_AND_ESCALATION",
  "NOT_DELIVERED",
  "RESOLVED",
  "MESSAGE",
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

const ServiceRequestItemSchema = z.object({
  serviceId: ObjectIdSchema,
  quantity: z.number().int().min(1).max(20),
});

const ServiceInstructionSnapshotSchema = z.object({
  message: z.string().max(500).optional(),
  baseInstruction: z.string().max(240).optional(),
  ruleMessage: z.string().max(240).optional(),
  ruleCondition: z.enum(["BEFORE_TIME", "AFTER_TIME"]).optional(),
  ruleTime: z.string().optional(),
});

export const hotelAlert = z.object({
  alertProgress: z.enum(alertProgressEnum).optional().default("CREATED"),
  serviceIds: z.array(ObjectIdSchema),
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  createdAt: z.number().optional(),
  wakeUpAt: z.number().optional(),
  acceptedAt: z.number().optional(),
  deliveredAt: z.number().optional(),
  rejectedAt: z.number().optional(),
  createdBy: ObjectIdSchema.optional(),
  // The staff member who raised this on the guest's behalf (front-office modal).
  // Absent when the guest raised it from their own device.
  raisedByStaff: ObjectIdSchema.optional(),
  acceptedBy: ObjectIdSchema.optional(),
  deliveredBy: ObjectIdSchema.optional(),
  rejectedBy: ObjectIdSchema.optional(),
  roomId: ObjectIdSchema,
  cart: z.array(z.object({})).optional(),
  serviceRequestItems: z.array(ServiceRequestItemSchema).optional().default([]),
  serviceInstructionSnapshot: ServiceInstructionSnapshotSchema.optional(),
  roomChatComplainId: ObjectIdSchema.optional(),
  message: z.string().optional(),
  isEscalated: z.boolean().optional().default(false),
  level: z.number().min(1).optional().default(1),
});

export const acceptHotelAlert = z.object({
  alertId: ObjectIdSchema,
  userId: ObjectIdSchema,
  action: z.enum(alertProgressEnum),
  reasonOfRejection: z.string().optional(),
});

export const updateAlertCart = z.object({
  alertId: ObjectIdSchema,
  userId: ObjectIdSchema.optional(),
  cart: z.array(z.object({})),
  removedItems: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(120),
        quantity: z.number().positive(),
        reason: z.string().min(1).max(200),
      }),
    )
    .optional()
    .default([]),
});

export type HotelAlertType = z.infer<typeof hotelAlert>;
export type AcceptHotelAlertType = z.infer<typeof acceptHotelAlert>;
export type UpdateAlertCartType = z.infer<typeof updateAlertCart>;
