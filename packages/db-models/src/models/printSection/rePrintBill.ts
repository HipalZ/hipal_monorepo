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
});

const ReBillPrint = mongoose.model("rebillprint", reBillPrintSchema);
export { ReBillPrint };
