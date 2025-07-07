import mongoose, { type Model } from "mongoose";
import {
  type PasswordManagerValidator,
  PasswordTypeEnum,
} from "../../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const passwordManagerSchema = new mongoose.Schema<PasswordManagerValidator>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
      enum: PasswordTypeEnum,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const PasswordManager: Model<PasswordManagerValidator> =
  mongoose.model<PasswordManagerValidator>(
    "passwordmanager",
    passwordManagerSchema,
  );
export { PasswordManager };
