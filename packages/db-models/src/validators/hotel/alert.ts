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

export const alertProgressEnum = [
  "CREATED",
  "ACCEPTED",
  "DELIVERED",
  "REJECTED",
] as const;

export type HotelAlertProgressEnumType = (typeof alertProgressEnum)[number];

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
});

export type HotelAlertType = z.infer<typeof hotelAlert>;
