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
});

const KotPrint = mongoose.model("kotprint", kotPrintSchema);
export { KotPrint };
