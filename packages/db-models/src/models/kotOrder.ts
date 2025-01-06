import mongoose, { Schema, type Model } from "mongoose";
import type { KotOrderItemType, KotOrderType } from "../validators";

// Define ObjectId for convenience
const ObjectId = Schema.Types.ObjectId;

// Cart Item Schema
const KotItemSchema = new Schema<KotOrderItemType>({
  id: {
    type: String,
    required: true,
  },
  dish: {
    type: Object,
    required: true,
  },
  portion: {
    type: Object,
    default: null,
  },
  extras: {
    type: [Object],
    default: [],
  },
  quantity: {
    type: Number,
    required: true,
  },
});

// Main Cart Schema
const KotOrderSchema = new Schema<KotOrderType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    phone: {
      type: String,
      required: true,
    },
    tableName: {
      type: String,
    },
    cart: {
      type: [Object],
      required: true,
    },
    date: {
      type: Number,
    },
    // createdAt: {
    //   type: Date,
    //   expires: 60 * 60 * 24 * 30,
    // },

    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const KotOrder: Model<KotOrderType> = mongoose.model<KotOrderType>(
  "kotorder",
  KotOrderSchema,
);

export { KotOrder };
