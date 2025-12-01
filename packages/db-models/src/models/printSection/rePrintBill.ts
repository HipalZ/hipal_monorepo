import mongoose from "mongoose";
const reBillPrintSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
  },
  billPrintCount: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 24, // 1 day in seconds
  },
});

const ReBillPrint = mongoose.model("rebillprint", reBillPrintSchema);
export { ReBillPrint };
