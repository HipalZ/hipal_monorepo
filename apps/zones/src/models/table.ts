import mongoose from "mongoose";

interface TableAttrs {
  businessId: string;
  zoneId: string;
  name: string;
  capacity: number;
  staff: string[];
  status: string;
  activeUser: number;
  time: string;
  totalDishQuantity: number;
  deliverdDish: number;
  role: Object;
  hiCode: string;
  isMerge: boolean;
  hierarchy: string;
  parentTableId: string;
  parentZoneId: string;
  mergeTables: [object];
  mergedBy?: string;
  reservedBy?: string;
}

interface TableModel extends mongoose.Model<TableDoc> {
  build(attrs: TableAttrs): TableDoc;
}

interface TableDoc extends mongoose.Document {
  businessId: string;
  zoneId: string;
  name: string;
  capacity: number;
  staff: string[];
  status: string;
  activeUser: number;
  time: string;
  totalDishQuantity: number;
  deliverdDish: number;
  role: Object;
  hiCode: string;
  isMerge: boolean;
  hierarchy: string;
  parentTableId: string;
  parentZoneId: string;
  mergeTables: [object];
  mergedBy?: string;
  reservedBy?: string;
}

const tableSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    zoneId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    staff: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      default: "Empty",
      enum: [
        "Occupied",
        "Settled",
        "Clean",
        "Empty",
        "Reserved",
        "Need assistance",
        "Active",
      ],
    },
    activeUser: {
      type: Number,
      default: 0,
    },
    time: {
      type: String,
      default: "",
    },
    totalDishQuantity: {
      type: Number,
      default: 0,
    },
    deliverdDish: {
      type: Number,
      default: 0,
    },
    role: {
      type: Object,
      default: null,
    },
    hiCode: {
      type: String,
      default: "",
    },
    isMerge: {
      type: Boolean,
      default: false,
    },
    hierarchy: {
      type: String,
      default: "",
    },
    parentTableId: {
      type: String,
      default: "",
    },
    parentZoneId: {
      type: String,
      default: "",
    },
    mergeTables: [Object],
    mergedBy: {
      type: String,
    },
    reservedBy: {
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

tableSchema.statics.build = (attrs: TableAttrs) => {
  return new Table(attrs);
};

const Table = mongoose.model<TableDoc, TableModel, {}>("Table", tableSchema);

export { Table };
