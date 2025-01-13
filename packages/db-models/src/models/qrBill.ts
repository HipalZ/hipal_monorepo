import mongoose, { type Model } from "mongoose";
import type { QrBillOrderType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const qrBillOrderSchema = new mongoose.Schema<QrBillOrderType>(
  {
    businessId: {
      type: ObjectId,
      required: false,
    },
    captainId: {
      type: ObjectId,
      required: false,
      ref: "User",
    },
    date: {
      type: Number,
      required: true,
    },
    expireIn: {
      type: Number,
      required: true,
      default: 300000,
    },
    requestBillId: {
      type: String,
      required: true,
      unique: true,
    },
    serviceCharge: {
      type: Number,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "EXPIRED"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  },
);

const QrBill: Model<QrBillOrderType> = mongoose.model<QrBillOrderType>(
  "qrbill",
  qrBillOrderSchema,
);

export { QrBill };
