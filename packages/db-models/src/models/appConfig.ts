import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import type { PermissionType } from '../validators';

const subPermissionMongooseSchema = new mongoose.Schema({
  subTitle: {
    type: String,
    required: true,
  },
  descriptions: {
    type: String,
    required: true,
  },
});

const roleMongooseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subPermissions: [subPermissionMongooseSchema],
});

const permissionsMongooseSchema = new mongoose.Schema<PermissionType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Business',
  },
  CO_OWNER: [roleMongooseSchema],
  MANAGER: [roleMongooseSchema],
  CAPTAIN: [roleMongooseSchema],
  MARKETING_AGENT: [roleMongooseSchema],
});
const Permissions: Model<PermissionType> = mongoose.model<PermissionType>('appconfig', permissionsMongooseSchema);

export { Permissions };
