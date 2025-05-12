import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
    .optional()
    .default(0),
  claimedCoins: z.coerce
    .number({
      message: "Claimed coins must be a number",
    })
    .optional()
    .default(0),
  discount: z.coerce
    .number({
      message: "Discount must be a number",
    })
    .optional()
    .default(0),
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
    .min(1, {
      message: "Table name must be at least 3 characters",
    })
    .max(150, {
      message: "Table name must be at most 150 characters",
    }),
  date: z.number(),
  couponId: ObjectIdSchema.optional(),
  channelId: ObjectIdSchema.optional(),
  cashbackAvailable: z.boolean().optional(),
  posBillId: z.string().optional(),
});

export type OrderType = z.infer<typeof OrderSchema>;
