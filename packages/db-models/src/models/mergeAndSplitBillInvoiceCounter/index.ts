import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { MergeAndSplitBillInvoiceCounterType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const mergeAndSplitBillInvoiceCounterSchema =
  new mongoose.Schema<MergeAndSplitBillInvoiceCounterType>({
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      index: true,
    },
    billInvoice: {
      type: Number,
      required: true,
    },
  });

const MergeAndSplitBillInvoiceCounter: Model<MergeAndSplitBillInvoiceCounterType> =
  mongoose.model<MergeAndSplitBillInvoiceCounterType>(
    "mergeAndSplitBillInvoiceCounter",
    mergeAndSplitBillInvoiceCounterSchema,
  );

export { MergeAndSplitBillInvoiceCounter };
