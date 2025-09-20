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
  couponDiscount: z.coerce
    .number({
      message: "Coupon discount must be a number",
    })
    .optional()
    .default(0),
  gst: z.coerce
    .number({
      message: "GST must be a number",
    })
    .optional()
    .default(0),

  variantId: z
    .string({
      message: "Variant ID must be a string",
    })
    .optional(),
});

export const jewelleryOrderSchema = z.object({
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

  date: z.number(),
  couponId: ObjectIdSchema.optional(),
  cashbackAvailable: z.boolean().optional(),
  couponDiscount: z.coerce
    .number({
      message: "Coupon discount must be a number",
    })
    .optional()
    .default(0),
  gst: z.coerce
    .number({
      message: "GST must be a number",
    })
    .optional()
    .default(0),

  isCoinApplied: z.boolean().optional().default(false),
  isCouponApplied: z.boolean().optional().default(false),
  isDiscountApplied: z.boolean().optional().default(false),
  subTotal: z.coerce
    .number({
      message: "Sub total must be a number",
    })
    .optional()
    .default(0),
  razorpayOrderId: z.string().optional(),
  staffId: ObjectIdSchema.optional(),
  isPaid: z.boolean().optional().default(false),
});

export type OrderType = z.infer<typeof OrderSchema>;
export type JewelleryOrderTypeValidator = z.infer<typeof jewelleryOrderSchema>;
