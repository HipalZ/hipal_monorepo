import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;
const duesHistorySchema = new mongoose.Schema({
  orderId: {
    type: ObjectId,
    required: false,
    ref: "Order",
    default: null,
  },
  billInvoiceNumber: {
    type: Number,
    required: false,
    default: 0,
  },
  settleAmount: {
    type: Number,
    required: false,
    default: 0,
  },
  userId: {
    type: ObjectId,
    required: false,
    ref: "User",
  },
  date: {
    type: Number,
    required: false,
    default: null,
  },
});

const DuesHistory = mongoose.model("dueshistory", duesHistorySchema);
export { DuesHistory };
