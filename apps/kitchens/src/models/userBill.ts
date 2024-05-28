import mongoose from "mongoose";

interface UserBillAttrs {
  businessId: string;
  zoneId:string,
  bill:[]
  tableId: string;
  time: string;
  date:string

}

interface UserBillModel extends mongoose.Model<UserBillDoc> {
  build(attrs: UserBillAttrs): UserBillDoc;
}

interface UserBillDoc extends mongoose.Document {
    businessId: string;
    zoneId:string,
    bill:[]
    tableId: string;
    time: string;
    date:string
}

const userBillSchema = new mongoose.Schema(
  {
    businessId: {
      required: true,
      type: String,
    },
    tableId: {
      required: true,
      type: String,
    },
 
    time: {
      type: String,
    },
   bill:{
      type:[]
   },
    zoneId:String,
    date:String
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

userBillSchema.statics.build = (attrs: UserBillAttrs) => {
  return new UserBill(attrs);
};

const UserBill = mongoose.model<UserBillDoc, UserBillModel, {}>(
  "userbill",
  userBillSchema
);

export { UserBill };
