import type { Model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";
import type { UserSessionSchemaType } from "../validators";
autoIncrement.initialize(mongoose.connection);
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

  gst: {
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
  couponId: {
    type: String,
    required: false,
  },

  couponDiscount: {
    type: Number,
    required: false,
    default: 0,
  },
  isDiscountApplied: {
    type: Boolean,
    required: false,
    default: false,
  },
  reasonOfDiscount: {
    type: String,
    required: false,
    default: "",
  },
  serviceChargeAppliedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
    default: null,
  },
  serviceChargeRemovedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
    default: null,
  },
  discountAppliedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
    default: null,
  },
  discountRemovedBy: {
    type: ObjectId,
    required: false,
    ref: "User",
    default: null,
  },
  reasonOfServiceCharge: {
    type: String,
    required: false,
    default: "",
  },
  subTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  total: {
    type: Number,
    required: false,
    default: 0,
  },
  otherTax: {
    type: Number,
    required: false,
    default: 0,
  },
  discountAppliedOn: {
    type: String,
    enum: ["ON_BILL", "ON_DISH"],
    required: false,
  },
  gstPercentage: {
    type: Number,
    required: false,
    default: 5,
  },
  serviceChargePercentage: {
    type: Number,
    required: false,
    default: 0,
  },
  newDishGst: {
    type: Number,
    required: false,
    default: 0,
  },
  isServiceChargeRemoved: {
    type: Boolean,
    required: false,
    default: false,
  },
  items: {
    type: [Object],
    required: false,
  },
  isUserRegistered: {
    type: Boolean,
    required: false,
    default: false,
  },
  billRequest: {
    type: Boolean,
    required: false,
    default: false,
  },
  billPrintCount: {
    type: Number,
    required: false,
    default: 0,
  },
  dishIds: {
    type: [String],
    required: false,
  },
  billInvoiceNumber: {
    type: Number,
    required: false,
    default: 0,
  },
  isSplit: {
    type: Boolean,
    required: false,
    default: false,
  },
  variantsCounts: {
    type: Number,
    required: false,
    default: 0,
  },

  discountPercentage: {
    type: Number,
    required: false,
    default: 0,
  },
  splitType: {
    type: String,
    enum: ["PORTION", "ITEM"],
    required: false,
    default: "PORTION",
  },
  totalGst: {
    type: Number,
    required: false,
    default: 0,
  },

  coinPercentage: {
    type: Number,
    required: false,
    default: 0,
  },

  couponPercentage: {
    type: Number,
    required: false,
    default: 0,
  },

  itemIds: {
    type: [String],
    required: false,
  },
  itemGst: {
    type: Number,
    required: false,
    default: 0,
  },

  itemGstAfterDiscount: {
    type: Number,
    required: false,
    default: 0,
  },
});

userSessionSchema.plugin(autoIncrement.plugin, {
  model: "usersession",
  field: "billInvoiceNumber", // <-- Will be added automatically
  startAt: 1,
  incrementBy: 1,
});

userSessionSchema.index({ businessId: 1, tableName: 1 }, { unique: true });

const UserSession: Model<UserSessionSchemaType> =
  mongoose.model<UserSessionSchemaType>("usersession", userSessionSchema);

export { UserSession };
