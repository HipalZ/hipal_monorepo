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
    tableId: {
      type: ObjectId,
      ref: "table",
      required: true,
    },
    cart: {
      type: [Object],
      required: true,
    },
    date: {
      type: Number,
    },

    rejected: {
      type: Boolean,
      default: false,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    reasonOfRejection: {
      type: String,
    },
    acceptedBy: {
      type: ObjectId,
      ref: "User",
    },
    editedBy: {
      type: ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: ObjectId,
      ref: "User",
    },

    settled: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      required: true,
    },
    switched: {
      type: Boolean,
      default: false,
    },
    switchedBy: {
      type: ObjectId,
      ref: "User",
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
