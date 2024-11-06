import mongoose, { type Model } from "mongoose";
import type { ReviewsType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewsSchema = new mongoose.Schema<ReviewsType>(
  {
    businessId: {
      required: true,
      type: ObjectId,
      index: true,
      ref: "Business",
    },
    userId: {
      required: true,
      type: ObjectId,
      index: true,
      ref: "User",
    },

    reviewRating: {
      required: true,
      type: Number,
      min: [1, "Review rating must be at least 1"],
      max: [5, "Review rating must be at most 5"],
    },
    description: {
      type: String,
    },
    improvementAreas: {
      type: [String],
    },
    foodTaste: {
      type: Number,
      required: false,
    },
    ambience: {
      type: Number,
      required: false,
    },
    hygiene: {
      type: Number,
      required: false,
    },
    service: {
      type: Number,
      required: false,
    },
    staffs: {
      type: [ObjectId],
      ref: "User",
      default: [],
    },
    date: {
      required: true,
      type: Number,
    },
    order_id: {
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Reviews: Model<ReviewsType> = mongoose.model<ReviewsType>(
  "customerReviews",
  reviewsSchema,
);

export { Reviews };
