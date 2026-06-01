import mongoose, { type Model } from "mongoose";
import type { WhatsAppApiKeyType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

/**
 * Storage for issued WhatsApp sandbox API keys.
 *
 * Hot path: every request to `/whatsapp/sandbox/*` runs a `findOne({ prefix,
 * isRevoked: false })` against this collection before performing a constant-
 * time hash comparison. The `prefix` index makes that O(1).
 */
const whatsAppApiKeySchema = new mongoose.Schema<WhatsAppApiKeyType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    keyHash: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    scopes: {
      type: [String],
      required: true,
      default: ["send", "templates:read"],
    },
    lastUsedAt: {
      type: Number,
      required: false,
    },
    isRevoked: {
      type: Boolean,
      required: true,
      default: false,
    },
    revokedAt: {
      type: Number,
      required: false,
    },
    createdBy: {
      type: ObjectId,
      required: false,
      ref: "User",
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

// "List my business's active keys" — used by the dashboard.
whatsAppApiKeySchema.index({ businessId: 1, isRevoked: 1 });

const WhatsAppApiKey: Model<WhatsAppApiKeyType> =
  mongoose.model<WhatsAppApiKeyType>("whatsAppApiKey", whatsAppApiKeySchema);

export { WhatsAppApiKey };
