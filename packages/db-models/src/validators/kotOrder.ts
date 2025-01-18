import mongoose from "mongoose";
import { z } from "zod";
import { dishSchema, portionSchema } from "./dish";

// Define a custom ObjectId validator for mongoose
const ObjectIdSchema = z.instanceof(mongoose.Types.ObjectId).or(
  z
    .string()
    .refine((val) => mongoose.isValidObjectId(val), {
      message: "Invalid ObjectId",
    })
    .transform((val) => new mongoose.Types.ObjectId(val)),
);

// Define the cart item schema
const KotOrderSchema = z.object({
  id: z.string().min(1),
  dish: dishSchema,
  portion: portionSchema.nullable(),
  extras: z
    .array(z.object({}), {
      message: "addOnIds is required",
    })
    .default([]),
  quantity: z.number().positive(),
  itemId: z.string().min(1).max(200).optional(),
});

// Define the main cart schema
export const kotSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  tableName: z.string().min(1).max(50).optional(),
  cart: z.array(KotOrderSchema),
  date: z.number().optional(),
  settled: z.boolean().default(false).optional(),
  rejected: z.boolean().default(false).optional(),
  accepted: z.boolean().default(false).optional(),
  edited: z.boolean().default(false).optional(),
  reasonOfRejection: z.string().min(1).max(500).optional(),
  acceptedBy: ObjectIdSchema.optional(),
  editedBy: ObjectIdSchema.optional(),
  rejectedBy: ObjectIdSchema.optional(),
  tableId: ObjectIdSchema,
  switched: z.boolean().default(false).optional(),
  switchedBy: ObjectIdSchema.optional(),

  phone: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
});

export type KotOrderType = z.infer<typeof kotSchema>;
export type KotOrderItemType = z.infer<typeof KotOrderSchema>;
