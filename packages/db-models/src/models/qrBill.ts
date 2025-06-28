import mongoose, { type Model } from "mongoose";
import type { QrBillOrderType } from "../validators";

const qrBillOrderSchema = new mongoose.Schema<QrBillOrderType>(
  {
    date: {
      type: Number,
      required: true,
    },

    billId: {
      type: String,
      required: true,
      unique: true,
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
