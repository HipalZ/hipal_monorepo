import { z } from 'zod';

const Portion = z.object({
  name: z.string(),
  price: z.coerce.number(),
  discount: z.coerce.number(),
  default: z.boolean(),
});

const Extra = z.object({
  name: z.string(),
  price: z.coerce.number(),
  qty: z.coerce.number(),
});

const SwiggyBillObject = z
  .object({
    totalItems: z.string(),
    subTotal: z.coerce.number(),
    packingCharges: z.coerce.number(),
    RxPayableGST: z.coerce.number(),
    discount: z.coerce.number(),
    totalPrice: z.coerce.number(),
    swiggyPayableGST: z.coerce.number(),
  })
  .optional();

const Dish = z.object({
  dishId: z.string(),
  name: z.string(),
  price: z.coerce.number(),
  qty: z.coerce.number(),
  comments: z.string(),
  extras: z.array(Extra),
  portions: Portion,
});

export const KOTAttrs = z.object({
  businessId: z.string(),
  kitchenId: z.string().optional(),
  zoneId: z.string(),
  tableId: z.string(),
  staffId: z.string().optional(),
  startedAt: z.coerce.number().optional(),
  cookedAt: z.coerce.number().optional(),
  status: z.string(),
  dish: Dish,
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  dishStatus: z.enum(['cooking', 'cooked', 'delivered']),
  kotTime: z.string().default(''),
  tableName: z.string().default(''),
  date: z.string().default('').optional(),
  instructions: z.string().optional(),
  dishType: z.string(),
  category: z.string(),
  kotDate: z.string(),
  priority: z.boolean().default(false).optional(),
  isDeleted: z.boolean().default(false).optional(),
  reasonForDelete: z.string().optional(),
  staffName: z.string().optional(),
  inventory: z.boolean().default(false).optional(),
  orderId: z.string().optional(),
  avgTime: z.coerce.number().optional(),
  taxes: z.array(z.object({})).default([]).optional(),
  swiggyBillObj: SwiggyBillObject,
  match: z.boolean().default(true),
  isGst: z.boolean().default(true),
  transferBy: z.string().optional(),
  switchedBy: z.string().optional(),
  deletedBy: z.string().optional(),
  itemAddedby: z.string().optional(),
});

export type KOTType = z.infer<typeof KOTAttrs>;

export type KotPortionType = z.infer<typeof Portion>;
export type KotExtraType = z.infer<typeof Extra>;
export type KotSwiggyBillObjectType = z.infer<typeof SwiggyBillObject>;
export type KotDishType = z.infer<typeof Dish>;
