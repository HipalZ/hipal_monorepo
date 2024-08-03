import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { UserTag } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const UserTagSchema = new mongoose.Schema<UserTag>(
  {
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    tagId: {
      type: ObjectId,
      required: true,
      ref: "Tag",
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    date: {
      type: Number,
      required: true,
    },
    reminderDate: {
      type: Number,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const UserTags: Model<UserTag> = mongoose.model<UserTag>(
  "UserTag",
  UserTagSchema,
);

export { UserTags };
