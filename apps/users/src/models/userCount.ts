import mongoose from "mongoose";
import { ClientRoles } from "@hipal/common";

interface UserCountAttrs {
  businessId: string;
  date: string;
}

interface UserCountModel extends mongoose.Model<UserCountDoc> {
  build(attrs: UserCountAttrs): UserCountDoc;
}

interface UserCountDoc extends mongoose.Document {
  businessId: string;
  date: string;
}

const userCountSchema = new mongoose.Schema(
  {
    businessId: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: false,
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

userCountSchema.statics.build = (attrs: UserCountAttrs) => {
  return new UserCount(attrs);
};

const UserCount = mongoose.model<UserCountDoc, UserCountModel, {}>(
  "UserCount",
  userCountSchema
);

export { UserCount };
