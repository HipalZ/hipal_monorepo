import mongoose from "mongoose";
const deleteKotPrintSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
});

const DeleteKotPrint = mongoose.model("deletekotprint", deleteKotPrintSchema);
export { DeleteKotPrint };
