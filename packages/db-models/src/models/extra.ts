import mongoose, { Model } from "mongoose";
import { ExtraType } from "../validators";

const extraSchema = new mongoose.Schema<ExtraType>(
  {
    businessId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    numOptions: {
      type: Number,
    },
    numSelections: {
      type: Number,
    },
    compulsory: {
      type: Number,
    },
    maxQuantity: {
      type: Number,
    },
    addOnType: {
      type: String,
    },

    items: [Object],
  },
  {
    timestamps: true,
  }
);

const Extra: Model<ExtraType> = mongoose.model<ExtraType>("Extra", extraSchema);
export { Extra };
