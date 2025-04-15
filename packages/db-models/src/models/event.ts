import mongoose, { type Model } from "mongoose";
import type { EventType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const eventSchema = new mongoose.Schema<EventType>({
  businessId: {
    type: ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Event: Model<EventType> = mongoose.model<EventType>("event", eventSchema);
export { Event };
