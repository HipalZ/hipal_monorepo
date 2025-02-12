import mongoose, { type Model } from "mongoose";
import type { SchedularManagerType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;

const schedularManagerSchema = new mongoose.Schema<SchedularManagerType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
    },
    schedularJobs: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const SchedularManager: Model<SchedularManagerType> =
  mongoose.model<SchedularManagerType>(
    "schedularmanager",
    schedularManagerSchema,
  );

export { SchedularManager };
