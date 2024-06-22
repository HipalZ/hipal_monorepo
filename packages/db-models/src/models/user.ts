import mongoose, { Model } from 'mongoose';
import { CustomRoleType, UserControllerType, UserType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

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

const userController = new mongoose.Schema<UserControllerType>(UserController);

const CustomRole = {
  businessId: {
    type: ObjectId,
    required: true,
    ref: 'Business',
  },
  customRoleId: {
    type: ObjectId,
    required: true,
    ref: 'Role',
  },
  role: {
    type: String,
  },
  accessControl: {
    type: userController,
    default: {},
  },
  bookMark: {
    type: Boolean,
    default: false,
  },
};

const customRoleSchema = new mongoose.Schema<CustomRoleType>(CustomRole);

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
      unique: true,
    },
    customRole: {
      type: [customRoleSchema],
      required: false,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const User: Model<UserType> = mongoose.model<UserType>('User', userSchema);

export { User };
