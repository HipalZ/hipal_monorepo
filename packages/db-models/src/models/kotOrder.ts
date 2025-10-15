import mongoose, { Schema, type Model } from "mongoose";
import autoIncrement from "mongoose-auto-increment";
import type { KotOrderItemType, KotOrderType } from "../validators";
autoIncrement.initialize(mongoose.connection);
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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: {
    type: String,
  },
  reasonOfDeletion: {
    type: String,
    maxlength: 500,
  },
  discount: {
    type: Number,
    default: 0,
  },
  itemStatus: {
    type: String,
    enum: ["IN_PROGRESS", "COOKED", "DELIVERED", "CANCELLED"],
    default: "IN_PROGRESS",
  },
  priority: {
    type: Boolean,
    default: false,
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
      type: [KotItemSchema],
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
    transferd: {
      type: Boolean,
      default: false,
    },
    transferedBy: {
      type: ObjectId,
      ref: "User",
    },
    fromTable: {
      type: String,
      default: "",
    },
    toTable: {
      type: String,
      default: "",
    },
    unSettled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: "",
    },
    bill: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSync: {
      type: Boolean,
      default: false,
    },
    kotInvoiceNumber: {
      type: Number,
      default: 0,
    },
    kotStatus: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
    priority: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

KotOrderSchema.plugin(autoIncrement.plugin, {
  model: "kotorder",
  field: "kotInvoiceNumber", // <-- Will be added automatically
  startAt: 1,
  incrementBy: 1,
});

const KotOrder: Model<KotOrderType> = mongoose.model<KotOrderType>(
  "kotorder",
  KotOrderSchema,
);

export { KotOrder };
