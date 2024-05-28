import mongoose from "mongoose";

interface ZoneAttrs {
  businessId: string;
  zoneName: string;
  zoneType: string;
  startTime: string;
  endTime: string;
  staff: string[];
  tables: string[];
  Occupied: number;
  charges: [];
}

interface ZoneModel extends mongoose.Model<ZoneDoc> {
  build(attrs: ZoneAttrs): ZoneDoc;
}

interface ZoneDoc extends mongoose.Document {
  businessId: string;
  zoneName: string;
  zoneType: string;
  startTime: string;
  endTime: string;
  staff: string[];
  tables: string[];
  Occupied: number;
  charges: [];
}

const zoneSchema = new mongoose.Schema(
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
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    staff: {
      type: [String],
      required: true,
    },
    tables: {
      type: [String],
      required: true,
    },
    Occupied: {
      type: Number,
      default: 0,
    },
    charges: {
      type: [Object],
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

zoneSchema.statics.build = (attrs: ZoneAttrs) => {
  return new Zone(attrs);
};

const Zone = mongoose.model<ZoneDoc, ZoneModel, {}>("Zone", zoneSchema);

export { Zone };
