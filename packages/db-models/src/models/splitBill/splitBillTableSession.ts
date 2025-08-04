import type { Model } from "mongoose";
import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";
import type { SplitBillTableSessionValidator } from "../../validators";
autoIncrement.initialize(mongoose.connection);
const ObjectId = mongoose.Schema.Types.ObjectId;
const splitBillTableSessionSchema =
  new mongoose.Schema<SplitBillTableSessionValidator>({
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },

    tableName: {
      type: String,
      required: true,
    },

    customerIds: {
      type: [ObjectId],
      required: false,
      ref: "User",
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

    variantInvoiceNumber: {
      type: Number,
      required: false,
      default: 0,
    },
    originTableSessionId: {
      type: ObjectId,
      required: true,
      ref: "usersession",
    },
    variantName: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: false,
      default: false,
    },
    generatedBy: {
      type: String,
      required: false,
    },
    customerName: {
      type: String,
      required: false,
    },
    phoneNumbers: {
      type: [String],
      required: false,
    },
    totalDishTotal: {
      type: Number,
      required: false,
      default: 0,
    },
    totalGst: {
      type: Number,
      required: false,
      default: 0,
    },
  });

splitBillTableSessionSchema.index(
  { originTableSessionId: 1, variantName: 1 },
  { unique: true },
);

splitBillTableSessionSchema.plugin(autoIncrement.plugin, {
  model: "splitbilltablesession",
  field: "variantInvoiceNumber",
  startAt: 1,
  incrementBy: 1,
});

const SplitBillTableSession: Model<SplitBillTableSessionValidator> =
  mongoose.model<SplitBillTableSessionValidator>(
    "splitbilltablesession",
    splitBillTableSessionSchema,
  );

export { SplitBillTableSession };
