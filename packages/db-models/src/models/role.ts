import mongoose, { Model } from "mongoose";
import { BusinessRoleType } from "../validators";
const roleSchema = new mongoose.Schema<BusinessRoleType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      required: true,
    },
    businessId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Role: Model<BusinessRoleType> = mongoose.model<BusinessRoleType>(
  "Role",
  roleSchema
);

export { Role };
