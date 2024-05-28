import mongoose from "mongoose";

interface PrinterAttrs {
  businessId: string;
  printers: Object;
  billPrinter: string;
}

interface PrinterModel extends mongoose.Model<PrinterDoc> {
  build(attrs: PrinterAttrs): PrinterDoc;
}

interface PrinterDoc extends mongoose.Document {
  businessId: string;
  printers: Object;
  billPrinter: string;
}

const printerSchema = new mongoose.Schema(
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
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

printerSchema.statics.build = (attrs: PrinterAttrs) => {
  return new Printer(attrs);
};

const Printer = mongoose.model<PrinterDoc, PrinterModel, {}>(
  "Printer",
  printerSchema
);

export { Printer };
