import mongoose, { Model } from 'mongoose';
import { PrinterType } from '../validators';

const printerSchema = new mongoose.Schema<PrinterType>(
  {
    businessId: {
      required: true,
      type: String,
    },
    printers: {
      type: Object,
    },
    billPrinter: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Printer: Model<PrinterType> = mongoose.model<PrinterType>('Printer', printerSchema);

export { Printer };
