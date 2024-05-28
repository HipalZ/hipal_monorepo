import mongoose from "mongoose";

interface StaffSettingAttrs {
  name: string;
  staffId: string;
  businessId: string;
  dayIn: string;
  dayOut: string;
  holidays: [];
  date: string;
  roleName: string;
}

interface StaffSettingModel extends mongoose.Model<StaffSettingDoc> {
  build(attrs: StaffSettingAttrs): StaffSettingDoc;
}

interface StaffSettingDoc extends mongoose.Document {
  name: string;
  staffId: string;
  businessId: string;
  dayIn: string;
  dayOut: string;
  holidays: [];
  date: string;
  roleName: string;
}

const staffSettingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    staffId: {
      type: String,
    },
    dayIn: {
      type: String,
      default: 0,
    },
    dayOut: {
      type: String,
      default: 0,
    },
    holidays: {
      type: [],
      default: [],
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

staffSettingSchema.statics.build = (attrs: StaffSettingAttrs) => {
  return new Staffsetting(attrs);
};

const Staffsetting = mongoose.model<StaffSettingDoc, StaffSettingModel, {}>(
  "Staffsetting",
  staffSettingSchema
);

export { Staffsetting };
