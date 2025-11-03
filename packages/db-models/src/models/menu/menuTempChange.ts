import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { MenuTempChangesTypeValidator } from "../../validators";

const ObjectId = mongoose.Schema.Types.ObjectId;
const menuTempChangesSchema = new mongoose.Schema<MenuTempChangesTypeValidator>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
      unique: true,
    },
    baseMenuId: {
      type: ObjectId,
      required: true,
      ref: "menu",
    },
    changedCategoryIds: {
      type: [ObjectId],
      required: false,
      ref: "category",
      default: [],
    },
    changedAddOnIds: {
      type: [ObjectId],
      required: false,
      ref: "addon",
      default: [],
    },
    changedTaxIds: {
      type: [ObjectId],
      required: false,
      ref: "tax",
      default: [],
    },
    changedKitchenIds: {
      type: [ObjectId],
      required: false,
      ref: "Kitchen",
      default: [],
    },
    changedDishIds: {
      type: [ObjectId],
      required: false,
      ref: "Dish",
      default: [],
    },
    isBaseMenuChanged: {
      type: Boolean,
      required: true,
    },
  },
);

const MenuTempChnages: Model<MenuTempChangesTypeValidator> =
  mongoose.model<MenuTempChangesTypeValidator>(
    "menutempchange",
    menuTempChangesSchema,
  );
export { MenuTempChnages };
