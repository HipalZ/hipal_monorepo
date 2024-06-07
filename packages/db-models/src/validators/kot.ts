import { z } from 'zod';

const Portion = z.object({
  name: z.string(),
  price: z.number(),
  discount: z.number(),
  default: z.boolean(),
});

const Extra = z.object({
  name: z.string(),
  price: z.number(),
  qty: z.number(),
});

const SwiggyBillObject = z
  .object({
    totalItems: z.string(),
    subTotal: z.number(),
    packingCharges: z.number(),
    RxPayableGST: z.number(),
    discount: z.number(),
    totalPrice: z.number(),
    swiggyPayableGST: z.number(),
  })
  .optional();

const Dish = z.object({
  dishId: z.string(),
  name: z.string(),
  price: z.number(),
  qty: z.number(),
  comments: z.string(),
  extras: z.array(Extra),
  portions: Portion,
});

const KOTAttrs = z.object({
  businessId: z.string(),
  kitchenId: z.string().optional(),
  zoneId: z.string().optional(),
  tableId: z.string().optional(),
  staffId: z.string().optional(),
  startedAt: z.number().optional(),
  cookedAt: z.number().optional(),
  status: z.string(),
  dish: Dish,
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  dishStatus: z.enum(['cooking', 'cooked', 'delivered']),
  kotTime: z.string().default(''),
  tableName: z.string().default(''),
  date: z.string().default(''),
  instructions: z.string().optional(),
  dishType: z.string(),
  category: z.string(),
  kotDate: z.string(),
  priority: z.boolean().default(false),
  isDeleted: z.boolean().default(false),
  reasonForDelete: z.string(),
  staffName: z.string(),
  inventory: z.boolean().default(false),
  orderId: z.string(),
  avgTime: z.number(),
  taxes: z.array(z.object({})).default([]),
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
