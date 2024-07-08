import mongoose, { Model } from 'mongoose';

import { CustomerType } from '../validators';

const customerSchema = new mongoose.Schema<CustomerType>(
  {
    businessId: {
      required: true,
      type: String,
      index: true,
    },
    name: {
      type: String,
    },
    phone: {
      required: true,
      type: String,
      index: true,
    },
    count: {
      required: true,
      default: 0,
      type: Number,
      min: [0, 'Count must be a non-negative number'],
    },
    date: {
      required: true,
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const ReviewsCustomer: Model<CustomerType> = mongoose.model<CustomerType>('customerReview', customerSchema);

export { ReviewsCustomer };
