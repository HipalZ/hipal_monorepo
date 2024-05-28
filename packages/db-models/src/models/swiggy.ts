import mongoose, { Model } from "mongoose";
import { Swiggy } from "../validators";

const swiggySchema = new mongoose.Schema<Swiggy>(
    {
        businessId: {
            type: String,
            required: true,
        },
        zoneName: {
            type: String,
            required: true,
        },
        zoneType: {
            type: String,
            required: true,
        },
        password: {
            type: String,
        },
        addCharges: {
            type: [Object],
        },
        commisions: {
            type: [Object],
            required: true,
        },
        tables: [],
        Occupied: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);


const Swiggy:Model<Swiggy> = mongoose.model<Swiggy>(
    "Swiggyzone",
    swiggySchema
);

export { Swiggy };
