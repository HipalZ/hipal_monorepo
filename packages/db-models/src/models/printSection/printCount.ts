import mongoose from "mongoose";
const kotIdPrintSchema = new mongoose.Schema({
  kotId: {
    type: String,
    required: true,
  },
  kotIdCount: {
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

const KotPrintCount = mongoose.model("kotprintcount", kotIdPrintSchema);
export { KotPrintCount };
