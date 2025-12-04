import mongoose from "mongoose";
const kotPrintSchema = new mongoose.Schema({
  kotId: {
    type: String,
    required: true,
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

const KotPrint = mongoose.model("kotprint", kotPrintSchema);
export { KotPrint };
