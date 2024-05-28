import mongoose from "mongoose";
import { ClientRoles } from "@hipal/common";

interface customRole {
  businessId: string;
  customRoleId: string;
  roleName: string;
}
interface userController {
  hibiz?: boolean;
  dish?: boolean;
  staff?: boolean;
  loyalty?: boolean;
  sale?: boolean;
  reports?: boolean;
  zones_table?: boolean;
}
interface UserAttrs {
  name: string;
  email: string;
  phone: string;
  role: ClientRoles;
  DOB?: string;
  userDiscription?: string;
  gender?: string;
  customRole?: customRole[];
  password?: string;
  accessControl?: userController;
  withScaner?: boolean;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  role: ClientRoles;
  DOB?: string;
  userDiscription?: string;
  gender?: string;
  customRole?: customRole[];
  password?: string;
  accessControl?: userController;
  withScaner?: boolean;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ClientRoles,
      required: true,
    },
    DOB: {
      type: String,
    },
    gender: {
      type: String,
    },
    userDiscription: {
      type: String,
    },
    customRole: {
      type: [Object],
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    accessControl: {
      type: Object,
      default: {},
    },
    withScaner: {
      type: Boolean,
      default: false,
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

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel, {}>("User", userSchema);

export { User };
