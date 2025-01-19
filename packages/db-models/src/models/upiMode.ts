import mongoose, { type Model } from "mongoose";
import type { UpiModeType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const upiModeSchema = new mongoose.Schema<UpiModeType>(
  {
    businessId: {
      type: ObjectId,
      required: false,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

upiModeSchema.index({ businessId: 1, name: 1 }, { unique: true });

const UpiMode: Model<UpiModeType> = mongoose.model<UpiModeType>(
  "upimode",
  upiModeSchema,
);

export { UpiMode };
