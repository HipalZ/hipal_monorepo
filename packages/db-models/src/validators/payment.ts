import { z } from "zod";
import { ObjectIdSchema } from "./common";

export const PaymentSchema = z.object({
  businessId: ObjectIdSchema,
  total: z.coerce
    .number({
      message: "Total must be a number",
    })
    .default(0),
  billValue: z.coerce
    .number({
      message: "Bill value must be a number",
    })
    .positive(),
  userId: ObjectIdSchema,
  mode: z
    .string({
      message: "Mode must be a string",
    })
    .min(2)
    .max(100),
  paymentMode: z.string().min(3).max(100),
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(1, {
      message: "Table name must be at least 3 characters",
    })
    .max(20, {
      message: "Table name must be at most 100 characters",
    }),
  claimedCoins: z.coerce
    .number({
      message: "Claimed coins must be a number",
    })
    .optional()
    .default(0),
  tips: z.coerce
    .number({
      message: "Tips must be a number",
    })
    .default(0),
  order_id: ObjectIdSchema,
  date: z.coerce.number({
    message: " Date must be a number",
  }),
  razorpayPaymentId: z
    .string({
      message: "Payment id must be a string",
    })
    .min(3, {
      message: "Payment id must be at least 3 characters",
    })
    .max(200, {
      message: "Payment id must be at most 200 characters",
    })
    .optional(),
  razorpayOrderId: z
    .string({
      message: "Order id must be a string",
    })
    .min(3, {
      message: "Order id must be at least 3 characters",
    })
    .max(200)
    .optional(),
  razorpayAcquirerData: z.any().optional(),
  razorpayEventId: z
    .string({
      message: "Event id must be a string",
    })
    .min(3, {
      message: "Event id must be at least 3 characters",
    })
    .max(200, {
      message: "Event id must be at most 200 characters",
    })
    .optional(),
  waiterName: z
    .string({
      message: "Waiter name must be a string",
    })
    .min(2, {
      message: "Waiter name must be at least 2 characters",
    })
    .max(200, {
      message: "Waiter name must be at most 200 characters",
    })
    .optional(),
  comment: z
    .string({
      message: " Comment must be a string",
    })
    .min(3, {
      message: "Comment must be at least 3 characters",
    })
    .max(200, {
      message: "Comment must be at most 200 characters",
    })
    .optional(),

  tagIds: z.array(ObjectIdSchema).optional(),

  reviewId: ObjectIdSchema.optional(),

  earnCoins: z.coerce.number({}).optional().default(0),
  couponId: ObjectIdSchema.optional(),
  channelId: ObjectIdSchema.optional(),
  posBillId: z
    .string({
      message: "Pos bill id must be a string",
    })
    .min(3, {
      message: "Pos bill id must be at least 3 characters",
    })
    .max(200, {
      message: "Pos bill id must be at most 200 characters",
    })
    .optional(),
  settleType: z
    .enum([
      "NORMAL_SETTLE",
      "HI_SETTLE",
      "FORCE_SETTLE",
      "PAYMENT_GATEWAY",
      "FREE_SETTLE",
      "DUES_SETTLE",
      "NPC_SETTLE",
      "COMPLIMENTARY_SETTLE",
    ])
    .optional(),
  serviceCharge: z.coerce.number({}).optional().default(0),
  tax: z.coerce.number({}).optional().default(0),
  posBillRequestId: z.string().optional(),
  splitModes: z
    .array(
      z.object({
        name: z.string().max(100),
        amount: z.coerce.number().positive(),
        _id: z.string().max(100),
      }),
    )
    .default([])
    .optional(),
  discount: z.coerce.number().default(0).optional(),
  initialTax: z.coerce.number().default(0).optional(),
  initialSubTotal: z.coerce.number().default(0).optional(),
  initialTotal: z.coerce.number().default(0).optional(),
  finalSubTotal: z.coerce.number().default(0).optional(),
  discountType: z.enum(["COINZ", "COUPONZ"]).optional().default("COINZ"),
  downloadUrl: z.string().min(3).max(200).optional(),
  isDeleted: z
    .boolean({
      required_error: "isDeleted must be a boolean",
      invalid_type_error: "isDeleted must be a boolean",
    })
    .default(false),
  updatedAt: z.number().optional(),
  updatedBy: ObjectIdSchema.optional(),
  couponDiscount: z.coerce.number().optional().default(0),
  billId: z.string().optional(),
  billItems: z.array(z.object({})).optional(),
  pin: z.string().optional(),
  billRequestId: z.string().optional(),
});

export type PaymentType = z.infer<typeof PaymentSchema>;
