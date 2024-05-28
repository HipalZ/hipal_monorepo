import mongoose from "mongoose";
import { ClientRoles } from '@hipal/common';

interface customRole {
  businessId: string;
  customRoleId: string;
};
interface AdminAttrs {
  name: string;
  email: string;
  phone: string;
  role: ClientRoles;
  customRole?: customRole[];
  password?: string;
};

interface AdminModel extends mongoose.Model<AdminDoc> {
  build(attrs: AdminAttrs): AdminDoc;
};

interface AdminDoc extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  role: ClientRoles;
  customRole?: customRole[];
  password: string;
};

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
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
  customRole: {
    type: [Object],
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

adminSchema.statics.build = (attrs: AdminAttrs) => {
  return new Admin(attrs);
};

const Admin = mongoose.model<AdminDoc, AdminModel, {}>('Admin', adminSchema);

export { Admin };
