import { z } from "zod";
import { ObjectIdSchema } from "./common";
import { dishSchema, portionSchema } from "./dish";

// Define a custom ObjectId validator for mongoose

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
  isDeleted: z.boolean().default(false),
  deletedBy: z.string().min(2).max(150).optional(),
  reasonOfDeletion: z.string().min(1).max(500).optional(),
  discount: z.number().default(0).optional(),
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
  transferd: z.boolean().default(false).optional(),
  transferedBy: ObjectIdSchema.optional(),

  phone: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
  fromTable: z.string().max(50).optional(),
  toTable: z.string().max(50).optional(),
  unSettled: z.boolean().default(false).optional(),
  message: z.string().max(300).optional(),
  bill: z.boolean().default(false).optional(),
  isDeleted: z.boolean().default(false).optional(),
  isSync: z.boolean().default(false).optional(),
});

export type KotOrderType = z.infer<typeof kotSchema>;
export type KotOrderItemType = z.infer<typeof KotOrderSchema>;
