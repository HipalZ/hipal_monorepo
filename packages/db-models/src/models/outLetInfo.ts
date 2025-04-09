import mongoose from "mongoose";

import type { Model } from "mongoose";
import type { OutLetInfoType } from "../validators";

import { Amenities, BusinessEnumType } from "../validators";
import { Business } from "./business";
const ObjectId = mongoose.Schema.Types.ObjectId;

const serviceStatusSchema = new mongoose.Schema({
  whatsapp: {
    type: Boolean,
    default: false,
  },
  payment_gateway: {
    type: Boolean,
    default: false,
  },
  google_my_business: {
    type: Boolean,
    default: false,
  },
  make_my_trip: {
    type: Boolean,
    default: false,
  },
  trip_advisor: {
    type: Boolean,
    default: false,
  },
});
const outLetInfoSchema = new mongoose.Schema<OutLetInfoType>({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
    ref: "Business",
  },
  endBannerUrl: {
    type: String,
    required: false,
  },

  name: {
    type: String,
    required: false,
  },
  fssai: {
    type: String,
    required: false,
  },
  gst: {
    type: String,
    required: false,
  },
  specialBannerUrl: {
    type: String,

    required: false,
  },
  logoUrl: {
    type: String,

    required: false,
  },
  description: {
    type: String,

    required: false,
  },
  tags: [
    {
      type: String,
    },
  ],
  phone: {
    type: String,

    required: false,
  },
  location: {
    type: String,

    required: false,
  },
  amenities: [
    {
      type: String,
      enum: Amenities,
      required: false,
    },
  ],
  address: {
    type: String,
    required: false,
  },
  avgRating: {
    type: Number,
    required: false,
  },

  customTiming: [
    {
      type: [],
      required: false,
    },
  ],
  footerDescription: {
    type: String,

    required: false,
  },
  socialMediaLinks: [
    {
      icon: {
        type: String,
        required: true,
      },
      link: {
        type: String,
        required: true,
      },
    },
  ],

  brandName: {
    type: String,

    required: false,
  },
  isCustomTime: {
    type: Boolean,
    default: false,
  },

  branchName: {
    type: String,

    required: false,
  },
  avgPricingForTwo: {
    type: Number,
    reuired: false,
  },
  placeId: {
    type: String,
    required: false,
  },
  placeUrl: {
    type: String,
    required: false,
  },
  specialDay: {
    type: Number,
    required: false,
  },
  serviceChargePercentage: {
    type: Number,
    default: 0,
  },
  gstPercentage: {
    type: Number,
    default: 5,
  },
  outLetType: {
    type: String,
    enum: BusinessEnumType,
    required: false,
    default: "MENU",
  },
  hideDishPrice: {
    type: Boolean,
    default: false,
  },

  isPosEnabled: {
    type: Boolean,
    default: false,
  },

  restId: {
    type: String,
    required: false,
  },
  posBusinessConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "businessposconfig",
  },
  startTime: {
    type: Number,
    default: 0,
  },
  endTime: {
    type: Number,
    default: 24,
  },
  aadharCard: {
    type: String,
    required: false,
  },
  bankAccount: {
    type: String,
    required: false,
  },
  companyRegistration: {
    type: String,
    required: false,
  },
  instruction: {
    type: String,
    required: false,
  },
  panCard: {
    type: String,
    required: false,
  },
  serviceStatus: serviceStatusSchema,
  helpPhoneNumber: {
    type: String,
    required: false,
  },
  newAmenities: {
    type: [ObjectId],
    ref: "hotelamenitie",
    required: false,
  },
  birthdayCampaign: {
    type: Boolean,
    default: false,
  },
  registeredName: {
    type: String,
    required: false,
  },
});

//middlewares
outLetInfoSchema.post("save", async (doc) => {
  const business = await Business.findById(doc._id);

  if (business) {
    await OutLetInfo.findByIdAndUpdate(
      doc._id,
      {
        $set: {
          outLetType: business.businessType,
        },
      },
      {
        new: true,
        upsert: true,
      },
    );
  }
});

const OutLetInfo: Model<OutLetInfoType> = mongoose.model<OutLetInfoType>(
  "outlet",
  outLetInfoSchema,
);

export { OutLetInfo };
