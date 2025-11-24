import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { MenuTypeValidator } from "../../validators";
import {
  CARD_LAYOUT_TYPES,
  CATEGORY_LAYOUT_TYPES,
  MENU_DAYS,
  MENU_TYPES,
} from "../../validators/menu/menu";
const ObjectId = mongoose.Schema.Types.ObjectId;
const menuSchema = new mongoose.Schema<MenuTypeValidator>({
  name: {
    type: String,
    required: true,
  },
  businessId: {
    type: ObjectId,
    required: true,
    ref: "Business",
  },
  zoneIds: {
    type: [ObjectId],
    required: true,
    ref: "zone",
  },
  menuType: {
    type: Number,
    enum: MENU_TYPES,
    default: MENU_TYPES.MAIN_SUB_DISH,
  },
  days: {
    type: [Number],
    enum: MENU_DAYS,
    default: [
      MENU_DAYS.SUNDAY,
      MENU_DAYS.MONDAY,
      MENU_DAYS.TUESDAY,
      MENU_DAYS.WEDNESDAY,
      MENU_DAYS.THURSDAY,
      MENU_DAYS.FRIDAY,
      MENU_DAYS.SATURDAY,
    ],
  },
  startTime: {
    type: Number,
    required: false,
    default: 0,
  },
  endTime: {
    type: Number,
    required: false,
    default: 86400000,
  },
  sourceMenuId: {
    type: ObjectId,
    ref: "menu",
    required: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  categoryLayout: {
    type: Number,
    enum: CATEGORY_LAYOUT_TYPES,
    default: CATEGORY_LAYOUT_TYPES.EDGE,
  },
  cardLayout: {
    type: Number,
    enum: CARD_LAYOUT_TYPES,
    default: CARD_LAYOUT_TYPES.GRID,
  },

  primaryColor: {
    type: String,
    required: true,
    default: "#000000",
  },
  secondaryColor: {
    type: String,
    required: true,
    default: "#000000",
  },
  default: {
    type: Boolean,
    default: false,
  },
  // serviceType: {
  //   type: String,
  //   enum: ["DINE_IN", "TAKE_AWAY", "DELIVERY", "BASE"],
  //   default: "BASE",
  // },
  // baseMenuId: {
  //   type: ObjectId,
  //   ref: "menu",
  //   required: false,
  //   default: null,
  // },
});

const Menu: Model<MenuTypeValidator> = mongoose.model<MenuTypeValidator>(
  "menu",
  menuSchema,
);
export { Menu };
