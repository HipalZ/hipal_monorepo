import mongoose from "mongoose";
import { Review } from "../validators"

const reviewSchema = new mongoose.Schema<Review>(
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
        timestamps: true
    }
);


const Review = mongoose.model<Review>(
    "Review",
    reviewSchema
);

export { Review };
