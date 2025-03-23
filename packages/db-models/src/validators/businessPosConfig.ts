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
export const OrderModeEnum = ["WITH_ORDER", "WITHOUT_ORDER"] as const;
export const OrderVerificationTypeEnum = ["USER", "CAPTAIN"] as const;

export const businessPosConfigSchema = z.object({
  businessId: ObjectIdSchema,
  orderMode: z.enum(OrderModeEnum),
  branchId: z.string().min(4).max(100),
  restName: z.string().min(4).max(50),
  accessKey: z.string().min(4).max(100).optional(),
  secretKey: z.string().min(4).max(100).optional(),
  authToken: z.string().min(4).max(100).optional(),
  restId: z.string().min(4).max(100),
  isDeleted: z.boolean().optional().default(false),
  orderVerificationType: z.enum(OrderVerificationTypeEnum),
  posName: z.string().min(2).max(100),
  posId: z.string().min(4).max(100).optional(),

  date: z.number().optional(),
});

export type BusinessPosConfigType = z.infer<typeof businessPosConfigSchema>;
