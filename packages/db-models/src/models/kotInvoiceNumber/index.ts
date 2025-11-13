import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { KotInvoiceNumberType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const kotInvoiceNumberSchema = new mongoose.Schema<KotInvoiceNumberType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
      index: true,
    },
    kotInvoiceNumber: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true },
);

const KotInvoiceNumber: Model<KotInvoiceNumberType> =
  mongoose.model<KotInvoiceNumberType>(
    "kotInvoiceNumber",
    kotInvoiceNumberSchema,
  );

export { KotInvoiceNumber };
