import type { Model } from "mongoose";
import mongoose, { Schema } from "mongoose";
import type {
  HotelServiceCategoryType,
  HotelServiceType,
} from "../../validators";

const ObjectId = Schema.Types.ObjectId;

const hotelServiceSchema = new Schema<HotelServiceType>({
  availability: { type: Boolean, default: true },
  name: { type: String, required: true },
  businessId: { type: ObjectId, required: true, ref: "Business" }, // ✅ Ensure this matches lowercase model
  image: { type: String },
  categoryId: { type: ObjectId, required: true, ref: "hotelservicecategory" },
  avgCompletionTime: { type: Number, default: 4 },
  avgAcceptanceTime: { type: Number, default: 2 },
  avgDeliveryTime: { type: Number, default: 3 },
  quantityLimit: { type: Number, default: 1, min: 1, max: 20 },
  serviceBehavior: {
    instructionEnabled: { type: Boolean, default: false },
    instruction: { type: String, default: "" },
    instructionRules: {
      type: [
        {
          condition: {
            type: String,
            enum: ["BEFORE_TIME", "AFTER_TIME"],
          },
          time: { type: String },
          message: { type: String },
        },
      ],
      default: [],
    },
  },
  sequence: { type: Number, default: 0 },
  // Rename-proof identifier for system-managed services (e.g. "CHECKOUT").
  systemKey: { type: String, required: false },
});

const hotelServiceCategorySchema = new Schema<HotelServiceCategoryType>({
  availability: { type: Boolean, default: true },
  name: { type: String, required: true },
  businessId: { type: ObjectId, required: true, ref: "Business" },
  image: { type: String },
  serviceIds: [{ type: ObjectId, ref: "hotelservice" }],
  sequence: { type: Number, default: 0 },
  // Rename-proof identifier for system-managed categories ("QUICK_ACTIONS").
  systemKey: { type: String, required: false },
});

const HotelService: Model<HotelServiceType> = mongoose.model<HotelServiceType>(
  "hotelservice",
  hotelServiceSchema,
);

const HotelServiceCategory: Model<HotelServiceCategoryType> =
  mongoose.model<HotelServiceCategoryType>(
    "hotelservicecategory",
    hotelServiceCategorySchema,
  );

export { HotelService, HotelServiceCategory };
