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
export const petPoojaPinTempModelSchema = z.object({
  businessId: ObjectIdSchema,
  pin: z.string().min(10).max(10),
  tableName: z.string().min(1).max(20),
  hiCode: z.string().min(1).max(20).optional(),
  customerName: z.string().min(1).max(50),
  phoneNumbers: z.array(z.string().min(10).max(10)),
  billGeneratedBy: z.string().min(1).max(50).optional(),
  billRequestId: z.string().min(1).max(50).optional(),
  billInvoiceId: z.string().min(1).max(50).optional(),
  tax: z.coerce.number().optional(),
  serviceCharge: z.coerce.number().optional(),
  settleType: z.string().min(1).max(50).optional(),
  performedBy: z.string().min(1).max(50).optional(),
});

export type PetPoojaPinTempModelType = z.infer<
  typeof petPoojaPinTempModelSchema
>;
