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
    createdAt: {
      type: Date,
      expires: 60 * 3,
    },
  },
  {
    timestamps: true,
  },
);

const TempTableSettle: Model<TempTebleSettleType> =
  mongoose.model<TempTebleSettleType>("tempTableSettle", tempTebleSettleSchema);

export { TempTableSettle };
