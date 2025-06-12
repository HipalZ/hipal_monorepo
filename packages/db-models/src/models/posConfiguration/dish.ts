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
    type: Boolean,
    required: false,
    default: true,
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
  kitchenId: {
    type: Boolean,
    required: false,
    default: true,
  },
  name: {
    type: Boolean,
    required: false,
    default: true,
  },
  price: {
    type: Boolean,
    required: false,
    default: true,
  },
  avgTime: {
    type: Boolean,
    required: false,
    default: true,
  },
  dishTypes: {
    type: Boolean,
    required: false,
    default: true,
  },
  categoryIds: {
    type: Boolean,
    required: false,
    default: true,
  },
  addOnIds: {
    type: Boolean,
    required: false,
    default: true,
  },
  tags: {
    type: Boolean,
    required: false,
    default: true,
  },
  portions: {
    type: Boolean,
    required: false,
    default: true,
  },
  calories: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const PosDishConfig: Model<PosDishConfigValidator> =
  mongoose.model<PosDishConfigValidator>("posdishconfig", posDishConfigSchema);
export { PosDishConfig };
