import mongoose, { type Model } from "mongoose";
import { type FilterGroupType, type Group, VisitEnum } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const filterSchema = new mongoose.Schema<FilterGroupType>({
  duration: {
    type: Number,
    required: true,
  },
  visit: {
    type: Number,
    required: true,
  },
  visitType: {
    type: String,
    required: true,
    enum: VisitEnum, // Assuming VisitType is an object with enum values
  },
  spend: {
    type: Number,
    required: true,
  },
  spendType: {
    type: String,
    required: true,
    enum: VisitEnum,
  },
});

const groupSchema = new mongoose.Schema<Group>(
  {
    name: {
      type: String,
      required: true,
    },
    businessId: {
      type: ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    filter: {
      type: [filterSchema],
      required: false,
    },

    autoUpdate: {
      type: Boolean,
      required: false,
      default: false,
    },
    groupColor: {
      type: String,
      required: false,
    },

    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    userIds: {
      type: [ObjectId],
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const GroupModel: Model<Group> = mongoose.model<Group>("Group", groupSchema);

export { GroupModel };
