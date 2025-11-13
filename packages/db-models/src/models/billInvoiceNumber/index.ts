import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { BillInvoiceNumberType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const billInvoiceNumberSchema = new mongoose.Schema<BillInvoiceNumberType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
    },
    billInvoiceNumber: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true },
);

billInvoiceNumberSchema.index({ businessId: 1 }, { unique: true });

const BillInvoiceNumber: Model<BillInvoiceNumberType> =
  mongoose.model<BillInvoiceNumberType>(
    "billInvoiceNumber",
    billInvoiceNumberSchema,
  );
export { BillInvoiceNumber };
