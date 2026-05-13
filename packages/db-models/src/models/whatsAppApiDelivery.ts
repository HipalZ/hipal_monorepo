import mongoose, { type Model } from "mongoose";
import type { WhatsAppApiDeliveryType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Audit trail for every `/whatsapp/sandbox/send` call. Written once before
 * the Meta dispatch (status=QUEUED) and then mutated in place to SENT or
 * FAILED. Drives both the public `GET /messages/:deliveryId` endpoint and
 * the in-dashboard "Recent API activity" panel.
 */
const whatsAppApiDeliverySchema = new mongoose.Schema<WhatsAppApiDeliveryType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    apiKeyId: {
      type: ObjectId,
      required: true,
      ref: "whatsAppApiKey",
    },
    templateName: {
      type: String,
      required: true,
    },
    templateId: {
      type: Number,
      required: false,
    },
    to: {
      type: String,
      required: true,
    },
    variables: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
    positional: {
      type: [String],
      required: true,
      default: [],
    },
    referenceId: {
      type: String,
      required: false,
    },
    idempotencyKey: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["QUEUED", "SENT", "FAILED"],
      required: true,
      default: "QUEUED",
    },
    metaMessageId: {
      type: String,
      required: false,
    },
    errorReason: {
      type: String,
      required: false,
    },
    errorDescription: {
      type: String,
      required: false,
    },
    durationMs: {
      type: Number,
      required: false,
    },
    date: {
      type: Number,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

// Dashboard list: "show this business's recent activity newest-first".
whatsAppApiDeliverySchema.index({ businessId: 1, date: -1 });

// Per-key audit: "what did this specific key do?".
whatsAppApiDeliverySchema.index({ apiKeyId: 1, date: -1 });

// Idempotency cache — sparse so rows without a key don't bloat the index.
whatsAppApiDeliverySchema.index(
  { idempotencyKey: 1 },
  { unique: true, sparse: true },
);

// Optional client-side lookup ("what did we send for Razorpay payment X?").
whatsAppApiDeliverySchema.index({ referenceId: 1 }, { sparse: true });

const WhatsAppApiDelivery: Model<WhatsAppApiDeliveryType> =
  mongoose.model<WhatsAppApiDeliveryType>(
    "whatsAppApiDelivery",
    whatsAppApiDeliverySchema,
  );

export { WhatsAppApiDelivery };
