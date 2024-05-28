import mongoose from "mongoose";

interface ReviewsAttrs {
  businessId: string;
  reviewerName?: string;
  reviewerPhone: string;
  reviewRating: number;
  description?: string;
  improvementAreas?: string[];
  date: number;
}

interface ReviewsModel extends mongoose.Model<ReviewsDoc> {
  build(attrs: ReviewsAttrs): ReviewsDoc;
}

interface ReviewsDoc extends mongoose.Document {
  businessId: string;
  reviewerName?: string;
  reviewerPhone: string;
  reviewRating: number;
  description?: string;
  improvementAreas?: string[];
  date: number;
}

const reviewsSchema = new mongoose.Schema(
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
      min: [1, "Review rating must be at least 1"],
      max: [5, "Review rating must be at most 5"],
    },
    description: {
      type: String,
    },
    improvementAreas: {
      type: [String],
    },
    date: {
      required: true,
      type: Number,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

reviewsSchema.statics.build = (attrs: ReviewsAttrs) => {
  return new Reviews(attrs);
};

const Reviews = mongoose.model<ReviewsDoc, ReviewsModel, {}>(
  "userReviews",
  reviewsSchema
);

export { Reviews };
