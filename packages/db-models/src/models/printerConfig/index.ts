import mongoose from "mongoose";

const printerConfigSchema = new mongoose.Schema({
  kitchenId: {
    type: String,
    required: true,
  },
  printerName: {
    type: String,
    required: true,
  },
  businessId: {
    type: String,
    required: true,
  },
  menuId: {
    type: String,
    required: true,
  },
  printerWidth: {
    type: String,
    default: "72mm",
    required: false,
  },
  pageWidth: {
    type: Number,
    default: 72000,
    required: false,
  },
  isPageWidthRequired: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const PrinterConfig = mongoose.model("printerconfig", printerConfigSchema);
export { PrinterConfig };
