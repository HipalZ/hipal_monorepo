import mongoose from "mongoose";
import { ClientRoles } from "@hipal/common";

interface BusinessAttrs {
  businessName: string;
  registeredName: string;
  businessType: string;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  customLink: string;
  logo: string;
  address: string;
  staff: string[];
  gstNumber: string;
  fssaiLicenseNumber: string;
  status: boolean;
  likes: string[];
  wallpaper: string;
  tier?: string;
  expiry?: number;
  open: string;
  close: string;
  isHasSetting: boolean;
  isHasDishData: boolean;
  hikitchen: boolean;
  hitable: boolean;
  hipeople: boolean;
  hibiz: boolean;
  kotPrinter: boolean;
  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeRemovalPass: number;
  serviceControl: Object;
  ownerPhone: number;
  takeAwayName: string;
  loyalty: boolean;
  isHasGst: boolean;
  gstPercentage: number;
  isPaymentIntegrated: boolean;
  withPopCorn: boolean;
}

interface BusinessModel extends mongoose.Model<BusinessDoc> {
  build(attrs: BusinessAttrs): BusinessDoc;
}

interface BusinessDoc extends mongoose.Document {
  businessName: string;
  registeredName: string;
  businessType: string;
  gstRegistered: boolean;
  multipleOutlets: boolean;
  customLink: string;
  logo: string;
  address: string;
  staff: string[];
  gstNumber: string;
  fssaiLicenseNumber: string;
  status: boolean;
  likes: string[];
  wallpaper: string;
  tier?: string;
  expiry?: number;
  open: string;
  close: string;
  isHasSetting: boolean;
  isHasDishData: boolean;
  hikitchen: boolean;
  hitable: boolean;
  hipeople: boolean;
  hibiz: boolean;
  kotPrinter: boolean;
  serviceCharge: boolean;
  serviceChargePercentage: number;
  serviceChargeRemovalPass: number;
  serviceControl: Object;
  ownerPhone: number;
  takeAwayName: string;
  loyalty: boolean;
  isHasGst: boolean;
  gstPercentage: number;
  isPaymentIntegrated: boolean;
  withPopCorn: boolean;
}

const businessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    registeredName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      required: true,
    },
    gstRegistered: {
      type: Boolean,
      required: true,
    },
    multipleOutlets: {
      type: Boolean,
      required: true,
    },
    customLink: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    staff: {
      type: [String],
      required: true,
    },
    gstNumber: {
      type: String,
      default: "",
      required: false,
    },
    fssaiLicenseNumber: {
      type: String,
      default: "",
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
    likes: {
      type: [String],
      required: false,
      default: [],
    },
    wallpaper: {
      type: String,
      required: false,
      default: "",
    },
    tier: {
      type: String,
      required: false,
    },
    expiry: {
      type: Number,
      required: false,
    },
    open: {
      type: String,
      default: 0,
    },
    close: {
      type: String,
      default: 0,
    },
    isHasSetting: {
      type: Boolean,
      default: false,
    },
    isHasDishData: {
      type: Boolean,
      default: false,
    },
    hikitchen: {
      type: Boolean,
      default: false,
    },
    hitable: {
      type: Boolean,
      default: false,
    },
    hipeople: {
      type: Boolean,
      default: false,
    },
    hibiz: {
      type: Boolean,
      default: false,
    },
    kotPrinter: {
      type: Boolean,
      default: false,
    },
    serviceChargePercentage: {
      type: Number,
    },
    serviceChargeRemovalPass: {
      type: Number,
    },
    serviceCharge: {
      type: Boolean,
      default: false,
    },
    serviceControl: {
      type: Object,
      default: {},
    },
    ownerPhone: {
      type: Number,
    },
    takeAwayName: {
      type: String,
      default: "",
    },
    loyalty: {
      type: Boolean,
      default: false,
    },
    isHasGst: {
      type: Boolean,
      default: true,
    },
    gstPercentage: {
      type: Number,
      default: 0.05,
    },
    isPaymentIntegrated: {
      type: Boolean,
      default: false,
    },
    withPopCorn: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

businessSchema.statics.build = (attrs: BusinessAttrs) => {
  return new Business(attrs);
};

const Business = mongoose.model<BusinessDoc, BusinessModel, {}>(
  "Business",
  businessSchema
);

export { Business };
