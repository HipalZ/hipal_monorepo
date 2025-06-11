import mongoose, { type Model } from "mongoose";
import type { KitchenType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const kitchenSchema = new mongoose.Schema<KitchenType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    name: {
      required: true,
      type: String,
    },
    description: {
      required: false,
      type: String,
    },
    staffIds: {
      type: [ObjectId],
      required: false,
    },
    dishIds: {
      type: [ObjectId],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Kitchen: Model<KitchenType> = mongoose.model<KitchenType>(
  "Kitchen",
  kitchenSchema,
);

export { Kitchen };
