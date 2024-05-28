import mongoose, { Model } from "mongoose";
import { Role } from "../validators"

const roleSchema = new mongoose.Schema<Role>({
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
}, {
  timestamps: true,
}
);

const Role: Model<Role> = mongoose.model<Role>('Role', roleSchema);

export { Role };
