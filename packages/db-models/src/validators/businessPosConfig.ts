import { z } from "zod";
import { ObjectIdSchema } from "./common";

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
  defaultTableName: z.string().min(1).max(50).optional(),
  active: z.boolean().optional().default(true),

  date: z.number().optional(),
});

export type BusinessPosConfigType = z.infer<typeof businessPosConfigSchema>;
