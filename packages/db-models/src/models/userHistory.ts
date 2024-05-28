import mongoose, { Model } from "mongoose";
import { UserTransaction } from "../validators";

const userTransitionSchema = new mongoose.Schema<UserTransaction>({
  userId: {
    type: String,
  },
  businessId: {
    type: String,
  },

  order_id: {
    type: String,
  },
  cart: {},
  date: {
    type: String,
  },
  phone_number: {
    type: String,
  },

  payment_mode: {
    type: String,
  },

  status: {
    type: Boolean,
    default: false,
  },

  deliver_to: {
    type: String,
  },
  totalWithoutTax: {
    type: Number,
  },
  OtherCharges: {
    type: [Object],
  },
  totalAmount: {
    type: Number,
  },
  businessName: {
    type: String,
    default: "",
  },
  businessLogo: {
    type: String,
    default: "",
  },
},
  {
    timestamps: true,

  })





const userTransactionHistory: Model<UserTransaction> = mongoose.model<
  UserTransaction
>("userTransaction", userTransitionSchema);

export { userTransactionHistory };
