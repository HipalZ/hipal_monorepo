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
    review: {
      type: String,
      default: "",
      maxlength: 250,
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
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Number,
      default: Date.now(),
      required: false,
    },
    readBy: {
      type: ObjectId,
      ref: "User",
      default: null,
      required: false,
    },
    roomId: {
      type: ObjectId,
      ref: "hotelroom",
      default: null,
    },
    alertId: {
      type: ObjectId,
      ref: "hotelalert",
      default: null,
    },
    note: {
      type: String,
      default: "",
      required: false,
    },
    serviceIds: {
      type: [ObjectId],
      ref: "hotelservice",
      default: [],
      required: false,
    },
    acceptedBy: {
      type: ObjectId,
      ref: "User",
      default: null,
      required: false,
    },
    deliveredBy: {
      type: ObjectId,
      ref: "User",
      default: null,
      required: false,
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
