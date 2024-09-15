import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { GoogleReviewType } from "../validators";
// Define the Mongoose schema
const googleReviewSchema = new mongoose.Schema<GoogleReviewType>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
});

googleReviewSchema.index(
  { businessId: 1, userId: 1, authorName: 1 },
  { unique: true },
);

const GoogleReview: Model<GoogleReviewType> = mongoose.model<GoogleReviewType>(
  "googleReview",
  googleReviewSchema,
);

export { GoogleReview };
