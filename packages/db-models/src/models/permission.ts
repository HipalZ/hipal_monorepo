import mongoose, { type Model } from "mongoose";
import type { StaffPermissionType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const permissionSchema = new mongoose.Schema<StaffPermissionType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const StaffPermission: Model<StaffPermissionType> =
  mongoose.model<StaffPermissionType>("staffpermission", permissionSchema);

export { StaffPermission };
