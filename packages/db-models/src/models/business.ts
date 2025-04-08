import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { BusinessType } from "../validators";
import { BusinessEnumType, ExploreLayout, MenuLayout } from "../validators";
import { MenuBanner } from "./menuBanner";
import { UpiMode } from "./upiMode";
import { OutLetInfo } from "./outLetInfo";
const ObjectId = mongoose.Schema.Types.ObjectId;
const businessSchema = new mongoose.Schema<BusinessType>(
  {
    name: {
      type: String,
      required: true,
    },

    businessType: {
      type: String,
      enum: BusinessEnumType,

      required: false,
    },
    parentOutLetId: {
      type: ObjectId,
      required: false,
      ref: "Business",
    },

    customLink: {
      type: String,
      required: true,
      unique: true,
    },

    staffIds: {
      type: [ObjectId],
      required: true,
      ref: "User",
    },

    status: {
      type: Boolean,
      required: false,
      default: true,
    },
    exploreLayout: {
      type: String,
      enum: ExploreLayout,
      required: false,
    },
    menuLayout: {
      type: String,
      enum: MenuLayout,
    },
    primaryColor: {
      type: String,
    },
    secondaryColor: {
      type: String,
    },
    outlet: {
      type: Boolean,
      default: true,
    },
    themeApplied: {
      type: Boolean,
      default: false,
    },
    logo: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    hotelIds: {
      type: [ObjectId],
      required: false,
    },
    restaurantIds: {
      type: [ObjectId],
      required: false,
    },
    recovery: {
      type: String,
      required: false,
    },
    registeredName: {
      type: String,
      required: false,
    },
    expiry: {
      type: Number,
      required: false,
      default: Date.now(),
    },
     capacity: { // relevant for bookingz
      type: Number,
      required: true,
      default: 50,
    },
  },
  {
    timestamps: true,
  },
);

//middlewares
businessSchema.post("save", async (doc) => {
  const defaultUpiModes = [
    { name: "cash", businessId: doc._id },
    { name: "(upi)machine", businessId: doc._id },
    { name: "(card)machine", businessId: doc._id },
    { name: "npc", businessId: doc._id },
    { name: "swiggypay", businessId: doc._id },
    { name: "zomatopay", businessId: doc._id },
    { name: "dues", businessId: doc._id },
    { name: "magicpin", businessId: doc._id },
    { name: "dineout", businessId: doc._id },
    { name: "complementary", businessId: doc._id },
  ];
  await UpiMode.insertMany(defaultUpiModes);

  const menuBaners = [
    {
      businessId: doc._id,
      heading: "Breakfast Must try",
      startTime: 4 * 60 * 60 * 1000,
      endTime: 12 * 60 * 60 * 1000,
      isPublished: true,
      dishIds: [],
    },
    {
      businessId: doc._id,
      heading: "Lunchi Munchi",
      startTime: 12 * 60 * 60 * 1000,
      endTime: 17 * 60 * 60 * 1000,
      isPublished: true,
      dishIds: [],
    },
    {
      businessId: doc._id,
      heading: "Snacky Evenings",
      startTime: 17 * 60 * 60 * 1000,
      endTime: 21 * 60 * 60 * 1000,
      isPublished: true,
      dishIds: [],
    },
    {
      businessId: doc._id,
      heading: "Late Dinners",
      startTime: 21 * 60 * 60 * 1000,
      endTime: 24 * 60 * 60 * 1000,
      isPublished: true,
      dishIds: [],
    },
    {
      businessId: doc._id,
      heading: "All Hours Delights",
      startTime: 0,
      endTime: 24 * 60 * 60 * 1000,
      isPublished: true,
      dishIds: [],
    },
  ];

  await MenuBanner.insertMany(menuBaners);


  await OutLetInfo.findOneAndUpdate(
    { businessId: doc._id }, // Filter condition
    { $set: { outLetType: doc.businessType } }, // Update operation
    { upsert: true, new: true } // Options: upsert ensures it creates a new document if not found
  );

});

const Business: Model<BusinessType> = mongoose.model<BusinessType>(
  "Business",
  businessSchema,
);

export { Business };
