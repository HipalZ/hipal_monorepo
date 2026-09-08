import mongoose, { Schema } from "mongoose";

const ObjectId = Schema.Types.ObjectId;

const hotelServiceAvailabilityTimingSchema = new Schema(
  {
    day: { type: Number, required: true, min: -1, max: 6, default: -1 },
    start: { type: Number, required: true, min: 0, max: 1439 },
    end: { type: Number, required: true, min: 1, max: 1440 },
  },
  { _id: false },
);

const hotelServiceAvailabilityGroupSchema = new Schema(
  {
    businessId: { type: ObjectId, required: true, ref: "Business", index: true },
    name: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true, index: true },
    timings: { type: [hotelServiceAvailabilityTimingSchema], default: [] },
    serviceIds: [{ type: ObjectId, ref: "hotelservice", index: true }],
  },
  { timestamps: true },
);

hotelServiceAvailabilityGroupSchema.index({ businessId: 1, name: 1 }, { unique: true });
hotelServiceAvailabilityGroupSchema.index({ businessId: 1, active: 1 });

const HotelServiceAvailabilityGroup =
  mongoose.models.hotelserviceavailabilitygroup ||
  mongoose.model(
    "hotelserviceavailabilitygroup",
    hotelServiceAvailabilityGroupSchema,
  );

export { HotelServiceAvailabilityGroup };
