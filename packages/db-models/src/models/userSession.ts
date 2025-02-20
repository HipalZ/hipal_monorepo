import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { UserSessionSchemaType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const userSessionSchema = new mongoose.Schema<UserSessionSchemaType>({
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  hiCode: {
    type: String,
    required: false,
    default: "",
  },
  pin: {
    type: String,
    required: true,
  },
  tableName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerIds: {
    type: [ObjectId],
    required: false,
    ref: "User",
  },
  phoneNumbers: {
    type: [String],
    required: true,
  },

  billGeneratedBy: {
    type: String,
    required: false,
  },
  billRequestId: {
    type: String,
    required: false,
  },
  billInvoiceId: {
    type: String,
    required: false,
  },
  tax: {
    type: Number,
    required: false,
    default: 0,
  },
  serviceCharge: {
    type: Number,
    required: false,
    default: 0,
  },
  settleType: {
    type: String,
    required: false,
  },
  performedBy: {
    type: String,
    required: false,
  },
  isTransfer: {
    type: Boolean,
    required: false,
    default: false,
  },
  transferTableTo: {
    type: String,
    required: false,
    default: "",
  },
  transferTableFrom: {
    type: String,
    required: false,
    default: "",
  },
  transferBy: {
    type: ObjectId,
    required: false,
    ref: "User",
  },
  transferType: {
    type: String,
    enum: ["TABLE", "ITEM"],
    required: false,
    default: "TABLE",
  },
  date: {
    type: Number,
    required: false,
  },
  isPinActive: {
    type: Boolean,
    default: false,
  },
  finalSubTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  finalTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  finalTax: {
    type: Number,
    required: false,
    default: 0,
  },
  intialSubTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  intialTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  intialTax: {
    type: Number,
    required: false,
    default: 0,
  },
  discount: {
    type: Number,
    required: false,
    default: 0,
  },
  tips: {
    type: Number,
    required: false,
    default: 0,
  },
  claimedCoins: {
    type: Number,
    required: false,
    default: 0,
  },
});

userSessionSchema.index({ businessId: 1, tableName: 1 }, { unique: true });

const UserSession: Model<UserSessionSchemaType> =
  mongoose.model<UserSessionSchemaType>("usersession", userSessionSchema);

export { UserSession };
