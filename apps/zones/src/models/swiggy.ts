import mongoose from "mongoose";

interface SwiggyAttrs {
  businessId: string;
  zoneName: string;
  zoneType: string;
  password: string;
  addCharges?: [Object];
  commisions?: [Object];
  tables: [];
  Occupied: number;
}

interface SwiggyModel extends mongoose.Model<SwiggyDoc> {
  build(attrs: SwiggyAttrs): SwiggyDoc;
}

interface SwiggyDoc extends mongoose.Document {
  businessId: string;
  zoneName: string;
  zoneType: string;
  password: string;
  addCharges?: [Object];
  commisions?: [Object];
  tables: [];
  Occupied: number;
}

const swiggySchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    zoneName: {
      type: String,
      required: true,
    },
    zoneType: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    addCharges: {
      type: [Object],
    },
    commisions: {
      type: [Object],
      required: true,
    },
    tables: [],
    Occupied: {
      type: Number,
      default: 0,
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

swiggySchema.statics.build = (attrs: SwiggyAttrs) => {
  return new Swiggy(attrs);
};

const Swiggy = mongoose.model<SwiggyDoc, SwiggyModel, {}>(
  "Swiggyzone",
  swiggySchema
);

export { Swiggy };
