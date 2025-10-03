import type { Model } from "mongoose";
import mongoose from "mongoose";
import type {
  StaffAttendenceTypeValidator,
  StaffshiftBreakTypeValidator,
} from "../../validators";

const ObjectId = mongoose.Types.ObjectId;

const staffshiftBreakSchema = new mongoose.Schema<StaffshiftBreakTypeValidator>(
  {
    startTime: {
      type: Number,
      required: true,
      default: 0,
    },
    endTime: {
      type: Number,
      required: true,
      default: 0,
    },
  },
);

const staffAttendenceSchema = new mongoose.Schema<StaffAttendenceTypeValidator>(
  {
    //@ts-ignore
    staffId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    createdAt: {
      type: Number,
      required: true,
      default: Date.now(),
    },
    activeHrs: {
      type: Number,
      required: true,
      default: 0,
    },
    lastActiveAt: {
      type: Number,
      default: 0,
    },
    shiftBreaks: {
      type: [staffshiftBreakSchema],
      default: [],
    },
    //@ts-ignore
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
  },
);

const StaffAttendence: Model<StaffAttendenceTypeValidator> =
  mongoose.model<StaffAttendenceTypeValidator>(
    "staffattendence",
    staffAttendenceSchema,
  );
export { StaffAttendence };
