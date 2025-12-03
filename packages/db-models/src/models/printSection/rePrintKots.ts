import mongoose from "mongoose";
const reKotPrintSchema = new mongoose.Schema({
  kotId: {
    type: String,
    required: true,
  },
  kotPrintCount: {
    type: Number,
    required: true,
    default: 0,
  },
  kitchenId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 24, // 1 day in seconds
  },
});

const ReKotPrint = mongoose.model("rekotprint", reKotPrintSchema);
export { ReKotPrint };
