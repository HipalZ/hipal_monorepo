import mongoose, { Model } from 'mongoose';

import { KOTType, KotDishType, KotExtraType, KotPortionType, KotSwiggyBillObjectType } from '../validators';

const kotExtraSchema = new mongoose.Schema<KotExtraType>(
  {
    name: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    qty: {
      type: Number,
      required: false,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

const kotPortionSchema = new mongoose.Schema<KotPortionType>(
  {
    name: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    discount: {
      type: Number,
      required: false,
    },
    default: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const kotSwiggyBillObjectSchema = new mongoose.Schema<KotSwiggyBillObjectType>(
  {
    totalItems: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    packingCharges: {
      type: Number,
      required: true,
    },
    RxPayableGST: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    swiggyPayableGST: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const kotDishSchema = new mongoose.Schema<KotDishType>(
  {
    dishId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
      required: false,
    },
    extras: {
      type: [kotExtraSchema],
      required: false,
      default: [],
    },
    portions: {
      type: kotPortionSchema,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const KOTSchema = new mongoose.Schema<KOTType>(
  {
    businessId: {
      type: String,
      required: true,
    },
    kitchenId: {
      type: String,
      required: false,
    },
    zoneId: {
      type: String,
      required: false,
    },
    tableId: {
      type: String,
      required: false,
    },
    staffId: {
      type: String,
      required: false,
    },
    startedAt: {
      type: Number,
      required: false,
    },
    cookedAt: {
      type: Number,
      required: false,
    },
    status: {
      type: String,
      required: true,
    },
    dish: {
      type: kotDishSchema,
      required: true,
    },
    customerName: {
      type: String,
      required: false,
    },
    customerPhone: {
      type: String,
      required: false,
    },
    dishStatus: {
      type: String,
      enum: ['cooking', 'cooked', 'delivered'],
      default: 'cooking',
    },
    kotTime: {
      type: String,
      default: '',
    },
    tableName: {
      type: String,
      default: '',
    },
    dishType: String,
    category: String,
    date: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      required: false,
    },
    kotDate: String,
    priority: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    reasonForDelete: {
      type: String,
    },
    staffName: {
      type: String,
    },
    inventory: {
      type: Boolean,
      default: false,
    },
    orderId: String,
    avgTime: Number,
    taxes: { type: [Object], default: null },
    swiggyBillObj: {
      type: kotSwiggyBillObjectSchema,
      default: null,
    },
    match: {
      type: Boolean,
      default: true,
    },
    isGst: {
      type: Boolean,
      default: true,
    },
    transferBy: {
      type: String,
    },
    switchedBy: {
      type: String,
    },
    deletedBy: {
      type: String,
    },
    itemAddedby: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Kot: Model<KOTType> = mongoose.model<KOTType>('KOT', KOTSchema);

export { Kot };
