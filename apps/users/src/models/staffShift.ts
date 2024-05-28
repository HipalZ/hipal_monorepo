import mongoose from "mongoose";

interface StaffshiftAttrs {
  name: string;
  staffId: string;
  businessId: string;
  dayIn: string;
  dayOut: string;
  status: string;
  totalWorkHr: string;
  rating: number;
  date: string;
  roleName: string;
}

interface StaffshiftModel extends mongoose.Model<StaffshiftDoc> {
  build(attrs: StaffshiftAttrs): StaffshiftDoc;
}

interface StaffshiftDoc extends mongoose.Document {
  name: string;
  staffId: string;
  dayIn: string;
  businessId: string;
  dayOut: string;
  status: string;
  totalWorkHr: string;
  rating: number;
  date: string;
  roleName: string;
}

const staffShiftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    staffId: {
      type: String,
    },
    dayIn: {
      type: String,
    },
    dayOut: {
      type: String,
    },
    status: {
      type: String,
    },
    totalWorkHr: {
      type: String,
    },
    rating: {
      type: Number,
    },
    date: String,
    businessId: String,
    roleName: String,
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

staffShiftSchema.statics.build = (attrs: StaffshiftAttrs) => {
  return new Staffshift(attrs);
};

const Staffshift = mongoose.model<StaffshiftDoc, StaffshiftModel, {}>(
  "Staffshift",
  staffShiftSchema
);

export { Staffshift };
