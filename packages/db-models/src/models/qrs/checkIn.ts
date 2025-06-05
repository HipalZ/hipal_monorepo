import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { CheckInQrValidator } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const checkInQrSchema = new mongoose.Schema<CheckInQrValidator>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
  },
  downloadLink: {
    type: String,
    required: false,
  },
  date: {
    type: Number,
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const CheckInQr: Model<CheckInQrValidator> = mongoose.model<CheckInQrValidator>(
  "checkinqr",
  checkInQrSchema,
);
export { CheckInQr };
