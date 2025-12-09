import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { RazorpayWebhookQueueModelValidatorType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const razorpayWebhookQueueModelSchema =
  new mongoose.Schema<RazorpayWebhookQueueModelValidatorType>({
    razorpayEventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    event: {
      type: String,
      required: true,
    },
    merchantId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAILED", "PROCESSING", "PENDING"],
    },
    date: {
      type: Number,
      required: false,
    },
    mode: {
      type: String,
      required: true,
    },
    error_description: {
      type: String,
      required: false,
      default: "",
    },
    error_reason: {
      type: String,
      required: false,
      default: "",
    },
    acquirer_data: {
      type: Object,
      required: false,
      default: {},
    },
  });

const RazorpayWebhookQueueModel: Model<RazorpayWebhookQueueModelValidatorType> =
  mongoose.model<RazorpayWebhookQueueModelValidatorType>(
    "razorpayWebhookQueue",
    razorpayWebhookQueueModelSchema,
  );
export { RazorpayWebhookQueueModel };
