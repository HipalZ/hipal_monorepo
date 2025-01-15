import mongoose, { type Model } from "mongoose";
import type { PosBillType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const posBillSchema = new mongoose.Schema<PosBillType>(
  {
    businessId: {
      type: ObjectId,
      required: false,
    },
    billRequestId: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [Object],
      required: false,
    },
    createdAt: {
      type: Date,
      expires: 60 * 60 * 24 * 5,
    },
    billInfo: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const PosBill: Model<PosBillType> = mongoose.model<PosBillType>(
  "posbill",
  posBillSchema,
);

export { PosBill };
