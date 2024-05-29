import mongoose, { Model } from "mongoose";
import { KotPasswordType } from "../validators";

const kotPasswordSchema = new mongoose.Schema<KotPasswordType>({
  businessId: {
    required: true,
    type: String,
  },
  password: {
    type: Number,
  },
});

const Kotpassword: Model<KotPasswordType> = mongoose.model<KotPasswordType>(
  "kotpassword",
  kotPasswordSchema
);

export { Kotpassword };
