import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { GoogleAuthUserType } from "../validators";

// Define the Mongoose schema
const googleAuthUserSchema = new mongoose.Schema<GoogleAuthUserType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,

    ref: "User",
  },
  authorName: {
    type: String,
    required: true,
  },
});

googleAuthUserSchema.index(
  { businessId: 1, userId: 1, authorName: 1 },
  { unique: true },
);

const GoogleAuthUser: Model<GoogleAuthUserType> =
  mongoose.model<GoogleAuthUserType>("GoogleAuthUser", googleAuthUserSchema);

export { GoogleAuthUser };
