import mongoose from "mongoose";

interface AttendenceAttrs {
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

interface AttendenceModel extends mongoose.Model<AttendenceDoc> {
  build(attrs: AttendenceAttrs): AttendenceDoc;
}

interface AttendenceDoc extends mongoose.Document {
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

const attendenceSchema = new mongoose.Schema(
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

attendenceSchema.statics.build = (attrs: AttendenceAttrs) => {
  return new Attendence(attrs);
};

const Attendence = mongoose.model<AttendenceDoc, AttendenceModel, {}>(
  "Attendence",
  attendenceSchema
);

export { Attendence };
