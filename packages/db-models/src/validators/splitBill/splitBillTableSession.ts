import { z } from "zod";
import { ObjectIdSchema } from "../common";

export const splitBillTableSessionSchema = z.object({
  businessId: ObjectIdSchema,
  tableName: z.string().min(1).max(20),
  serviceCharge: z.coerce.number().optional().default(0),
  settleType: z.string().min(1).max(50).optional(),
  date: z.coerce.number().optional(),
  total: z.coerce.number().optional().default(0),
  subTotal: z.coerce.number().optional().default(0),
  gst: z.coerce.number().optional().default(0),
  discount: z.coerce.number().optional().default(0),
  tips: z.coerce.number().optional().default(0),
  claimedCoins: z.coerce.number().optional().default(0),
  couponId: z.string().max(50).optional(),
  couponDiscount: z.coerce.number().optional().default(0),
  isDiscountApplied: z.boolean().default(false).optional(),
  reasonOfDiscount: z.string().max(100).optional(),
  serviceChargeAppliedBy: ObjectIdSchema.optional(),
  serviceChargeRemovedBy: ObjectIdSchema.optional(),
  discountAppliedBy: ObjectIdSchema.optional(),
  discountRemovedBy: ObjectIdSchema.optional(),
  reasonOfServiceCharge: z.string().max(100).optional(),
  discountAppliedOn: z.enum(["ON_BILL", "ON_DISH"]).optional(),
  gstPercentage: z.coerce.number().optional().default(5),
  serviceChargePercentage: z.coerce.number().optional().default(0),
  newDishGst: z.coerce.number().optional().default(0),
  isServiceChargeRemoved: z.boolean().optional().default(false),
  customerIds: z.array(ObjectIdSchema).optional(),
  items: z.array(z.object({})).optional(),
  billPrintCount: z.coerce.number().optional().default(0),
  variantInvoiceNumber: z.coerce.number().optional().default(0),
  originTableSessionId: z.string().min(1).max(50),
  variantName: z.number().min(1).max(50),
  isPaid: z.boolean().optional().default(false),
  generatedBy: z.string().min(1).max(50).optional(),
  customerName: z.string().min(1).max(50).optional(),
  phoneNumbers: z.array(z.string().min(1).max(50)).optional(),
  totalDishTotal: z.coerce.number().optional().default(0),
  totalGst: z.coerce.number().optional().default(0),
});

export type SplitBillTableSessionValidator = z.infer<
  typeof splitBillTableSessionSchema
>;
