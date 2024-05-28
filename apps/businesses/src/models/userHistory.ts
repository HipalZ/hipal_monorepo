import mongoose from "mongoose";

interface userTransitionAttrs {
  userId: string;
  businessId: string;
  order_id: string;
  date: string;
  phone_number: string;
  cart: any;
  payment_mode: string;
  status: boolean;
  deliver_to: string;
  totalWithoutTax: number;
  OtherCharges?: [Object];
  totalAmount: number;
  businessLogo: string;
  businessName: string;
}
interface userTransitionModel extends mongoose.Model<UserTransactionDoc> {
  build(attrs: userTransitionAttrs): UserTransactionDoc;
}
interface UserTransactionDoc extends mongoose.Document {
  userId: string;
  businessId: string;
  order_id: string;
  date: string;
  phone_number: string;
  cart: any;
  payment_mode: string;
  status: boolean;
  deliver_to: string;
  totalWithoutTax: number;
  OtherCharges?: [Object];
  totalAmount: number;
  businessLogo: string;
  businessName: string;
}
const userTransitionSchema = new mongoose.Schema({
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
  }
 
});

userTransitionSchema.statics.build = (attrs: userTransitionAttrs) => {
  return new userTransactionHistory(attrs);
};

const userTransactionHistory = mongoose.model<
  UserTransactionDoc,
  userTransitionModel,
  {}
>("userTransaction", userTransitionSchema);

export { userTransactionHistory };
