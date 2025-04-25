import { z } from "zod";
import { dishSchema, portionSchema } from "./dish";

// Define a custom ObjectId validator for mongoose
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



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
  isArchived: z.boolean().optional(),
  createdAt: z.date().optional(),
  isSettle: z.boolean().optional(),
  phone: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
});

export type CartType = z.infer<typeof cartSchema>;
export type CartItemType = z.infer<typeof CartItemSchema>;
