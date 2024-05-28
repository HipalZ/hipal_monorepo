import mongoose from "mongoose";

interface CustomerAttrs {
  businessId: string;
  name?: string;
  phone: string;
  count: number;
  date: number;
}

interface CustomerModel extends mongoose.Model<CustomerDoc> {
  build(attrs: CustomerAttrs): CustomerDoc;
}

interface CustomerDoc extends mongoose.Document {
  businessId: string;
  name?: string;
  phone: string;
  count: number;
  date: number;
}

const customerSchema = new mongoose.Schema(
  {
    businessId: {
      required: true,
      type: String,
      index: true,
    },
    name: {
      type: String,
    },
    phone: {
      required: true,
      type: String,
      index: true,
    },
    count: {
      required: true,
      default: 0,
      type: Number,
      min: [0, "Count must be a non-negative number"],
    },
    date: {
      required: true,
      type: Number,
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

customerSchema.statics.build = (attrs: CustomerAttrs) => {
  return new Customer(attrs);
};

const Customer = mongoose.model<CustomerDoc, CustomerModel, {}>(
  "Customer",
  customerSchema
);

export { Customer };
