import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelStaffRoleType } from "../../validators";
import { hotelStaffRoleEnum } from "../../validators";
const hotelStaffRoleSchema = new mongoose.Schema<HotelStaffRoleType>({
  role: {
    type: String,
    enum: hotelStaffRoleEnum,
    required: true,
  },
});

const HotelStaffRole: Model<HotelStaffRoleType> =
  mongoose.model<HotelStaffRoleType>("hotelstaffrole", hotelStaffRoleSchema);
export { HotelStaffRole };
