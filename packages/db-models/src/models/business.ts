import mongoose, { Model } from "mongoose";
import { Business } from "../validators";

const businessSchema = new mongoose.Schema<Business>(
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
    }, {
    timestamps: true,

}
);

const Business: Model<Business> = mongoose.model<Business>(
    "Business",
    businessSchema
);

export { Business };
