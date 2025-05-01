import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { PosCardConfigValidator } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const posCardConfigSchema = new mongoose.Schema<PosCardConfigValidator>({
  analytic: {
    type: Boolean,
    required: false,
    default: true,
  },
  couponz: {
    type: Boolean,
    required: false,
    default: true,
  },
  event: {
    type: Boolean,
    required: false,
    default: true,
  },
  explorePage: {
    type: Boolean,
    required: false,
    default: true,
  },
  hipeople: {
    type: Boolean,
    required: false,
    default: true,
  },
  loyalty: {
    type: Boolean,
    required: false,
    default: true,
  },
  payment: {
    type: Boolean,
    required: false,
    default: true,
  },
  pos: {
    type: Boolean,
    required: false,
    default: true,
  },
  review: {
    type: Boolean,
    required: false,
    default: true,
  },
  setting: {
    type: Boolean,
    required: false,
    default: true,
  },
  staff: {
    type: Boolean,
    required: false,
    default: true,
  },
  thumbnailStrip: {
    type: Boolean,
    required: false,
    default: true,
  },
  theme: {
    type: Boolean,
    required: false,
    default: true,
  },
  whatsapp: {
    type: Boolean,
    required: false,
    default: true,
  },
  zones: {
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

const PosCardConfig: Model<PosCardConfigValidator> =
  mongoose.model<PosCardConfigValidator>("poscardconfig", posCardConfigSchema);
export { PosCardConfig };
