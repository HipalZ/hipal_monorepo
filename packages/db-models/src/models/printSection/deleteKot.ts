import mongoose from "mongoose";
const deleteKotPrintSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 24, // 1 day in seconds
  },
});

const DeleteKotPrint = mongoose.model("deletekotprint", deleteKotPrintSchema);
export { DeleteKotPrint };
