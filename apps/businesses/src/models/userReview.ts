import mongoose from "mongoose";
interface ReviewAttrs {
  userId: string;
  businessId: string;
  keyword: string;
  rating: string;
  comment: string;
  dateTime: string;
  reviewerName: string;
  description: string;
  satisfactionRating: string;
  mostLiked: string[];
  foodRating: string;
  waiterRating: string;

  businessLogo: string;
  businessName: string;
}

interface ReviewModel extends mongoose.Model<ReviewDoc> {
  build(attrs: ReviewAttrs): ReviewDoc;
}

interface ReviewDoc extends mongoose.Document {
  userId: string;
  businessId: string;
  keyword: string;
  rating: string;
  comment: string;
  dateTime: string;
  reviewerName: string;
  description: string;
  satisfactionRating: string;
  mostLiked: string[];
  foodRating: string;
  waiterRating: string;
  businessLogo: string;
  businessName: string;
}

const reviewSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
    },
    userId: {
      type: String,
    },
    businessId: {
      type: String,
    },
    rating: {
      type: String,
    },
    comment: {
      type: String,
    },
    dateTime: {
      type: String,
    },
    businessName: {
      type: String,
    },
    businessLogo: {
      type: String,
    },
    reviewerName: {
      type: String,
    },
    description: {
      type: String,
    },
    satisfactionRating: {
      type: String,
    },
    mostLiked: {
      type: [String],
      default: [],
    },
    foodRating: {
      type: String,
    },
    waiterRating: {
      type: String,
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

reviewSchema.statics.build = (attrs: ReviewAttrs) => {
  return new Review(attrs);
};

const Review = mongoose.model<ReviewDoc, ReviewModel, {}>(
  "Review",
  reviewSchema
);

export { Review };
