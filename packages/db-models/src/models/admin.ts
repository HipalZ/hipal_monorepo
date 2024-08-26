import mongoose, { type Model } from "mongoose";
import type { AdminType } from "../validators";
const adminSchema = new mongoose.Schema<AdminType>({
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["HIPAL_ADMIN"],
    default: "HIPAL_ADMIN",
    required: true,
  },
});

const Admin: Model<AdminType> = mongoose.model<AdminType>("admin", adminSchema);
export { Admin };
