import mongoose, { Model } from "mongoose";
import { UserType } from "../validators";

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: false,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },

    DOB: {
      type: String,
    },
    gender: {
      type: String,
    },
    userDiscription: {
      type: String,
    },
    customRole: {
      type: [Object],
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    accessControl: {
      type: Object,
      default: {},
    },
    withScaner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<UserType> = mongoose.model<UserType>("User", userSchema);

export { User };
