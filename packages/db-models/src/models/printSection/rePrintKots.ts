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
});

const ReKotPrint = mongoose.model("rekotprint", reKotPrintSchema);
export { ReKotPrint };
