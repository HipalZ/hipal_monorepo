import mongoose, { type Model } from "mongoose";
import type { CustomRoleType, UserType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const CustomRoleSchema = new mongoose.Schema<CustomRoleType>({
  businessId: {
    type: ObjectId,
    required: true, // Assuming ObjectIdSchema is required
    ref: "Business", // Assuming it references a Business collection
  },
  role: {
    type: String,
    required: true,
  },
  permissions: {
    type: {},
    required: false, // Optional in Zod
  },
  permissionGroupIds: {
    type: [ObjectId],
    required: false, // Optional in Zod
  },
  permissionIds: {
    type: [ObjectId],
    required: false, // Optional in Zod
  },
  bookMark: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  nickName: {
    type: String,
    required: false,
  },
});

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
      unique: true,
    },
    customRole: {
      type: [CustomRoleSchema],
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    dob: {
      type: Number,
      required: false,
    },
    role: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<UserType> = mongoose.model<UserType>("User", userSchema);

export { User };
