import mongoose, { type Model } from "mongoose";
import type { PendingDuesType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const pendingDuesSchema = new mongoose.Schema<PendingDuesType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    billId: {
      type: ObjectId,
      required: true,
      unique: true,
      ref: "Payment",
    },
    duesUserId: {
      type: ObjectId,
      required: true,
    },
    isSettled: {
      type: Boolean,
      required: false,
      default: false,
    },
    date: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const PendingDues: Model<PendingDuesType> = mongoose.model<PendingDuesType>(
  "pendingdues",
  pendingDuesSchema,
);

export { PendingDues };
