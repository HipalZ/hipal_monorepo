import mongoose, { type Model } from 'mongoose';
import type { CustomRoleType, UserType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const CustomRole = {
  businessId: {
    type: ObjectId,
    required: true,
    ref: 'Business',
  },
  permissions: {
    type: [String],
    default: {},
  },
  bookMark: {
    type: Boolean,
    default: false,
  },
};

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: false,
      default: true,
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
      type: [],
      required: false,
    },
    password: {
      type: String,
      required: false,
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
