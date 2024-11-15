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

// Define the main cart schema
export const cartSchema = z.object({
  businessId: ObjectIdSchema,
  userId: ObjectIdSchema,
  tableName: z.string().min(1).max(50).optional(),
  cart: z.array(CartItemSchema),
  date: z.number().optional(),
  message: z.string().optional(),
  createdAt: z.date().optional(),
});

export type CartType = z.infer<typeof cartSchema>;
export type CartItemType = z.infer<typeof CartItemSchema>;
