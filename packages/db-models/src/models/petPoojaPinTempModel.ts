import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { PetPoojaPinTempModelType } from "../validators";
const ObjectId = mongoose.Schema.Types.ObjectId;
const petPoojaPinTempModelSchema =
  new mongoose.Schema<PetPoojaPinTempModelType>({
    businessId: {
      type: ObjectId,
      required: true,
      ref: "Business",
    },
    hiCode: {
      type: Number,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    tableName: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
  });

const PetPoojaPinTemp: Model<PetPoojaPinTempModelType> =
  mongoose.model<PetPoojaPinTempModelType>(
    "petpoojapintemp",
    petPoojaPinTempModelSchema,
  );

export { PetPoojaPinTemp };
