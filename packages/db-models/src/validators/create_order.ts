import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



export const razorpayOrderSchema = z.object({
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
    .positive({
      message: "Bill value must be positive",
    }),
  claimedCoins: z.coerce
    .number({
      message: "Claimed coins must be a number",
    })

    .default(0)
    .optional(),
  tips: z.coerce
    .number({
      message: "Tips must be a number",
    })
    .default(0)
    .optional(),
  currency: z
    .string({
      message: "Currency must be a string",
    })
    .min(3)
    .max(3),
  userId: ObjectIdSchema,
  tableName: z
    .string({
      message: "Table name must be a string",
    })
    .min(1, {
      message: "Table name must be at least 3 characters",
    })
    .max(100, {
      message: "Table name must be at most 100 characters",
    }),
  date: z.coerce
    .number({
      message: "Date must be a number",
    })
    .optional(),
  couponId: ObjectIdSchema.optional(),
  channelId: ObjectIdSchema.optional(),
  cashbackAvailable: z.boolean().optional(),
  posBillId: z.string().optional(),
});

export type RazorpayOrderType = z.infer<typeof razorpayOrderSchema>;
