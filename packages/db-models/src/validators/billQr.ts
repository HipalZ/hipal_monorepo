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

  date: z.number(),
  createdAt: z.date().optional(),
});

export type QrBillOrderType = z.infer<typeof qrBillOrderSchema>;
