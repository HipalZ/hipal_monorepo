import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { PetPoojaPinTempModelType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const petPoojaPinTempModelSchema =
  new mongoose.Schema<PetPoojaPinTempModelType>({
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
    },
    serviceCharge: {
      type: Number,
      required: false,
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
  });

petPoojaPinTempModelSchema.index(
  { businessId: 1, tableName: 1 },
  { unique: true },
);

const PetPoojaPinTemp: Model<PetPoojaPinTempModelType> =
  mongoose.model<PetPoojaPinTempModelType>(
    "petpoojapintemp",
    petPoojaPinTempModelSchema,
  );

export { PetPoojaPinTemp };
