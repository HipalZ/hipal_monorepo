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
export const OrderSchema = z.object({
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
    }),
  billValue: z.coerce
    .number({
      message: "Bill value must be a number",
    })
    .positive({
      message: "Bill value must be positive",
    }),
  userId: ObjectIdSchema,
  tips: z.coerce
    .number({
      message: "Tips must be a number",
    })
    .optional(),
  claimedCoins: z.coerce
    .number({
      message: "Claimed coins must be a number",
    })
    .optional(),
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
    }),
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(3, {
      message: "Table name must be at least 3 characters",
    })
    .max(150, {
      message: "Table name must be at most 150 characters",
    }),
  date: z.number(),
  couponId: ObjectIdSchema.optional(),
  channelId: ObjectIdSchema.optional(),
  cashbackAvailable: z.boolean().optional(),
});

export type OrderType = z.infer<typeof OrderSchema>;
