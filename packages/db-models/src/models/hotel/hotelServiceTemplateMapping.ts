import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { HotelServiceTemplateMappingType } from "../../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const hotelServiceTemplateMappingSchema =
  new mongoose.Schema<HotelServiceTemplateMappingType>({
    serviceName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    templateId: {
      type: Number,
      required: true,
    },
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
  });

const HotelServiceTemplateMapping: Model<HotelServiceTemplateMappingType> =
  mongoose.model<HotelServiceTemplateMappingType>(
    "hotelservicetemplatemapping",
    hotelServiceTemplateMappingSchema,
  );
export { HotelServiceTemplateMapping };
