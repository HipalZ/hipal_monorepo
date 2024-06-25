import mongoose, { Model } from 'mongoose';

import { ReviewsType } from '../validators';

const reviewsSchema = new mongoose.Schema<ReviewsType>(
  {
    businessId: {
      required: true,
      type: String,
      index: true,
    },
    reviewerName: {
      type: String,
    },
    reviewerPhone: {
      required: true,
      type: String,
    },
    reviewRating: {
      required: true,
      type: Number,
      min: [1, 'Review rating must be at least 1'],
      max: [5, 'Review rating must be at most 5'],
    },
    description: {
      type: String,
    },
    improvementAreas: {
      type: [String],
    },
    foodTaste: {
      type: Boolean,
    },
    ambience:{
      type:Boolean
    },
    hygiene: {
      type: Boolean,
    },
    service:{
      type:Boolean
    },
    staffs:{
      type:[String]
    },
    date: {
      required: true,
      type: Number,
      default: Date.now(),
    },
    order_id: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Reviews: Model<ReviewsType> = mongoose.model<ReviewsType>('customerReviews', reviewsSchema);

export { Reviews };
