import mongoose, { Model } from "mongoose";

import { KOTType } from "../validators";

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
      type: Object,
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
      enum: ["cooking", "cooked", "delivered"],
      default: "cooking",
    },
    kotTime: {
      type: String,
      default: "",
    },
    tableName: {
      type: String,
      default: "",
    },
    dishType: String,
    category: String,
    date: {
      type: String,
      default: "",
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
      type: Object,
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
  }
);

const Kot: Model<KOTType> = mongoose.model<KOTType>("KOT", KOTSchema);

export { Kot };
