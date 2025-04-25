import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });


export const whatsAppOrderSchema = z.object({
  total: z.coerce
    .number({
      message: "Total must be a number",
    })
    .default(0),
  currency: z
    .string({
      message: "Currency must be a string",
    })
    .min(3, {
      message: "Currency must be at least 3 characters",
    })
    .max(3, {
      message: "Currency must be at most 3 characters",
    }),
  receipt: z
    .string({
      message: "Receipt must be a string",
    })
    .min(3, {
      message: "Receipt must be at least 3 characters",
    })
    .max(200, {
      message: "Receipt must be at most 100 characters",
    })
    .optional(),
  billValue: z.coerce
    .number({
      message: "Bill value must be a number",
    })
    .positive({
      message: "Bill value must be positive",
    }),
  userId: ObjectIdSchema,

  discount: z.coerce
    .number({
      message: "Discount must be a number",
    })
    .optional(),
  businessId: ObjectIdSchema,
  order_id: z
    .string({
      message: "Order id must be a string",
    })
    .min(3, {
      message: "Order id must be at least 3 characters",
    })
    .max(200, {
      message: "Order id must be at most 150 characters",
    })
    .optional(),

  date: z.coerce
    .number({
      message: "Date must be a number",
    })
    .optional(),
});

export type WhatAppOrderType = z.infer<typeof whatsAppOrderSchema>;
