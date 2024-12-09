import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { UserSessionType } from "../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSessionSchema = new mongoose.Schema<UserSessionType>(
  {
    customerPhone: {
      type: String,
      required: true,
    },
    businessId: {
      type: ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 60 * 60 * 3,
    },
  },
  {
    timestamps: true,
  },
);

const UserSession: Model<UserSessionType> = mongoose.model<UserSessionType>(
  "usersession",
  userSessionSchema,
);

export { UserSession };
