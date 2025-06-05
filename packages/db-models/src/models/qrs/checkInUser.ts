import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CheckInQrUserValidator } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const checkInQrUserSchema = new mongoose.Schema<CheckInQrUserValidator>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  userId: {
    type: ObjectId,
    required: true,
  },
  date: {
    type: Number,
    required: false,
  },
  qrId: {
    type: ObjectId,
    required: true,
  },
});

const CheckInQrUser: Model<CheckInQrUserValidator> =
  mongoose.model<CheckInQrUserValidator>("checkinqruser", checkInQrUserSchema);
export { CheckInQrUser };
