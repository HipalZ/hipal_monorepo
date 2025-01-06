import mongoose, { Schema, type Model } from "mongoose";
import type { CartItemType, CartType } from "../validators";

// Define ObjectId for convenience
const ObjectId = Schema.Types.ObjectId;

// Cart Item Schema
const CartItemSchema = new Schema<CartItemType>({
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
const CartSchema = new Schema<CartType>(
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
    message: {
      type: String,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isSettle: {
      type: Boolean,
      required: false,
      default: false,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Cart: Model<CartType> = mongoose.model<CartType>("Cart", CartSchema);

export { Cart };
