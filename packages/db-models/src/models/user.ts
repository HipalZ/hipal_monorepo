import mongoose, { Model } from 'mongoose';
import { CustomRoleType, UserControllerType, UserType } from '../validators';

const CustomRole = {
  businessId: {
    type: String,
    // required: true,
  },
  customRoleId: {
    type: String,
    // required: true,
  },
  roleName: {
    type: String,
    // required: true,
  },
};

const UserController = {
  hibiz: {
    type: Boolean,
    required: false,
  },
  dish: {
    type: Boolean,
    required: false,
  },
  staff: {
    type: Boolean,
    required: false,
  },
  loyalty: {
    type: Boolean,
    required: false,
  },
  sale: {
    type: Boolean,
    required: false,
  },
  reports: {
    type: Boolean,
    required: false,
  },
  zones_table: {
    type: Boolean,
    required: false,
  },
};

const customRoleSchema = new mongoose.Schema<CustomRoleType>(CustomRole);

const userController = new mongoose.Schema<UserControllerType>(UserController);

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: false,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
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
      type: [customRoleSchema],
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    accessControl: {
      type: userController,
      default: {},
    },
    role: {
      type: String,
    },
    withScaner: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<UserType> = mongoose.model<UserType>('User', userSchema);

export { User };
