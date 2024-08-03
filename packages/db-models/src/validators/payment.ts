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
    .min(3)
    .max(100),
  paymentMode: z.string().min(3).max(100),
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(3, {
      message: "Table name must be at least 3 characters",
    })
    .max(100, {
      message: "Table name must be at most 100 characters",
    }),
  claimedCoins: z.coerce
    .number({
      message: "Claimed coins must be a number",
    })
    .optional(),
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

  tagId: ObjectIdSchema.optional(),
  tagTypeId: ObjectIdSchema.optional(),

  reviewId: ObjectIdSchema.optional(),

  earnCoins: z.coerce.number({}).optional(),
});

export type PaymentType = z.infer<typeof PaymentSchema>;
