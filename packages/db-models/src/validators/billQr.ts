import { z } from "zod";
const ObjectIdSchema = z
  .string()
  .length(24, { message: "ObjectId must be 24 characters" })
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid hex string" });



const qrBillOrderSchema = z.object({
  businessId: ObjectIdSchema,
  total: z.coerce.number(),
  tax: z.coerce.number(),
  serviceCharge: z.coerce.number(),
  tableName: z.string().min(3).max(100),
  captainId: ObjectIdSchema,
  requestBillId: z.string().min(3).max(100),
  expireIn: z.number().default(300000),
  isPaid: z.boolean().default(false),
  status: z
    .enum(["PENDING", "SUCCESS", "FAILED", "EXPIRED"])
    .default("PENDING"),

  date: z.number(),
  createdAt: z.date().optional(),
  subTotal: z.coerce.number().optional(),
  claimedCoins: z.coerce.number().optional(),
  tips: z.coerce.number().optional(),
  couponId: ObjectIdSchema.optional(),
  initialTotal: z.coerce.number().optional(),
});

export type QrBillOrderType = z.infer<typeof qrBillOrderSchema>;
