import mongoose from "mongoose";
import { ClientRoles } from '@hipal/common';

interface RoleAttrs {
  name: string;
  description: string;
  permissions: string[];
  businessId: string;
};

interface RoleModel extends mongoose.Model<RoleDoc> {
  build(attrs: RoleAttrs): RoleDoc;
};

interface RoleDoc extends mongoose.Document {
  name: string;
  description: string;
  permissions: string[];
  businessId: string;
};

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: {
    type: [String],
    required: true,
  },
  businessId: {
    type: String,
    required: true,
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

roleSchema.statics.build = (attrs: RoleAttrs) => {
  return new Role(attrs);
};

const Role = mongoose.model<RoleDoc, RoleModel, {}>('Role', roleSchema);

export { Role };
