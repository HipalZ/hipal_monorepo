import mongoose, { type Model } from "mongoose";
import type { PermissionGroupType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const permissionGroupSchema = new mongoose.Schema<PermissionGroupType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    permissions: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const StaffPermissionGroup: Model<PermissionGroupType> =
  mongoose.model<PermissionGroupType>(
    "staffpermissiongroup",
    permissionGroupSchema,
  );

export { StaffPermissionGroup };
