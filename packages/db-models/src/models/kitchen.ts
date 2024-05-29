import mongoose, { Model } from "mongoose";
import { KitchenType } from "../validators";

const kitchenSchema = new mongoose.Schema<KitchenType>(
  {
    businessId: {
      required: true,
      type: String,
    },
    kitchenName: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    staff: {
      required: false,
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Kitchen: Model<KitchenType> = mongoose.model<KitchenType>(
  "Kitchen",
  kitchenSchema
);

export { Kitchen };
