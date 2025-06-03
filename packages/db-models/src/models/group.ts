import mongoose, { type Model } from "mongoose";
import { type FilterGroupType, type Group, VisitEnum } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const tagsSchema = new mongoose.Schema({
  tagId: {
    type: ObjectId,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },

  countType: {
    type: String,
    required: true,
    enum: VisitEnum, // Assuming countType is an object with enum values
  },
});
const filterSchema = new mongoose.Schema<FilterGroupType>({
  duration: {
    type: Number,
    required: true,
  },
  visit: {
    type: Number,
    required: false,
  },
  visitType: {
    type: String,
    required: false,
    enum: VisitEnum, // Assuming VisitType is an object with enum values
  },
  spend: {
    type: Number,
    required: false,
  },
  spendType: {
    type: String,
    required: false,
    enum: VisitEnum,
  },
  cardBalance: {
    type: Number,
    required: false,
  },
  cardBalanceType: {
    type: String,
    required: false,
    enum: VisitEnum, // Assuming cardBalanceType is an object with enum values
  },

  coinzIssued: {
    type: Number,
    required: false,
  },
  coinzIssuedType: {
    type: String,
    required: false,
    enum: VisitEnum, // Assuming coinzIssuedType is an object with enum values
  },

  coinzUsed: {
    type: Number,
    required: false,
  },

  coinzUsedType: {
    type: String,
    required: false,
    enum: VisitEnum, // Assuming coinzUsedType is an object with enum values
  },
  tags: {
    type: [tagsSchema],
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
    groupType: {
      type: String,
      enum: ["DYNAMIC", "MANUAL"],
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
    },
    morning: {
      type: Boolean,
      required: false,
      default: false,
    },
    afternoon: {
      type: Boolean,
      required: false,
      default: false,
    },
    evening: {
      type: Boolean,
      required: false,
      default: false,
    },
    night: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const GroupModel: Model<Group> = mongoose.model<Group>("Group", groupSchema);

export { GroupModel };
