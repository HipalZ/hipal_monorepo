import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { DishZoneKitchenType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const dishZoneKitchenSchema = new mongoose.Schema<DishZoneKitchenType>(
  {
    businessId: {
      type: ObjectId,
      ref: "Business",
      required: true,
    },
    dishId: {
      type: ObjectId,
      ref: "Dish",
      required: true,
    },
    kitchenId: {
      type: ObjectId,
      ref: "Kitchen",
      required: true,
    },
    zoneId: {
      type: ObjectId,
      ref: "zone",
      required: true,
    },
  },
  { timestamps: true },
);

dishZoneKitchenSchema.index({ dishId: 1, zoneId: 1 }, { unique: true });

const DishZoneKitchen: Model<DishZoneKitchenType> =
  mongoose.model<DishZoneKitchenType>("dishZoneKitchen", dishZoneKitchenSchema);
export { DishZoneKitchen };
