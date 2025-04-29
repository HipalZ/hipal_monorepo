import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { PosDishConfigValidator } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const posDishConfigSchema = new mongoose.Schema<PosDishConfigValidator>({
  description: {
    type: Boolean,
    required: false,
    default: true,
  },
  images: {
    type: Boolean,
    required: false,
    default: true,
  },
  visibility: {
    type: Boolean,
    required: false,
    default: true,
  },
  recommendationIds: {
    type: [ObjectId],
    required: false,
    ref: "Dish",
    default: [],
  },
  availabilty: {
    type: Boolean,
    required: false,
    default: true,
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
});

const PosDishConfig: Model<PosDishConfigValidator> =
  mongoose.model<PosDishConfigValidator>("posdishconfig", posDishConfigSchema);
export { PosDishConfig };
