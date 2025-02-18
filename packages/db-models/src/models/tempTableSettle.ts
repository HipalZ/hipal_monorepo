import mongoose, { type Model } from "mongoose";
import type { TempTebleSettleType } from "../validators";
const tempTebleSettleSchema = new mongoose.Schema<TempTebleSettleType>(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    tableName: {
      type: String,
      required: true,
    },
    settleBy: {
      type: String,
      required: false,
    },

    hiCode: {
      type: String,
      required: false,
      default: "",
    },
    pin: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const TempTableSettle: Model<TempTebleSettleType> =
  mongoose.model<TempTebleSettleType>("tempTableSettle", tempTebleSettleSchema);

export { TempTableSettle };
