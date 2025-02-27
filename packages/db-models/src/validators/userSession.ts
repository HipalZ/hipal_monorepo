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
export const userSessionSchema = z.object({
  businessId: ObjectIdSchema,
  pin: z.string().min(10).max(10),
  tableName: z.string().min(1).max(20),
  hiCode: z.string().min(1).max(20).optional(),
  customerName: z.string().min(1).max(50),
  phoneNumbers: z.array(z.string().min(10).max(10)),
  billGeneratedBy: z.string().min(1).max(50).optional(),
  billRequestId: z.string().min(1).max(50).optional(),
  billInvoiceId: z.string().min(1).max(50).optional(),
  tax: z.coerce.number().optional().default(0),
  serviceCharge: z.coerce.number().optional().default(0),
  settleType: z.string().min(1).max(50).optional(),
  performedBy: z.string().min(1).max(50).optional(),
  customerIds: z.array(ObjectIdSchema).optional(),
  isTransfer: z.boolean().default(false).optional(),
  transferTableTo: z.string().min(1).max(50).optional(),
  transferTableFrom: z.string().min(1).max(50).optional(),
  transferBy: ObjectIdSchema.optional(),
  transferType: z.enum(["TABLE", "ITEM"]).optional(),
  date: z.coerce.number().optional(),
  isPinActive: z.boolean().default(false),
  initialTax: z.coerce.number().optional().default(0),
  initialTotal: z.coerce.number().optional().default(0),
  initialSubTotal: z.coerce.number().optional().default(0),
  finalTax: z.coerce.number().optional().default(0),
  finalTotal: z.coerce.number().optional().default(0),
  finalSubTotal: z.coerce.number().optional().default(0),
  discount: z.coerce.number().optional().default(0),
  tips: z.coerce.number().optional().default(0),
  claimedCoins: z.coerce.number().optional().default(0),
  couponId: ObjectIdSchema.optional(),
});

export type UserSessionSchemaType = z.infer<typeof userSessionSchema>;
