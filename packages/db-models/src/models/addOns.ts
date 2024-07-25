import mongoose, { type Model } from "mongoose";
import type { AddOnType, ChoiceType } from "../validators";
import { DishTypeEnum } from "../validators";
import { ChoiceTypeEnum } from "../validators/addOns";
const ObjectId = mongoose.Schema.Types.ObjectId;
const choicesSchema = new mongoose.Schema<ChoiceType>({
  name: { type: String, required: true },
  price: { type: Number, required: true },

  visibility: { type: Boolean, required: true, default: true },
  availability: { type: Boolean, required: true, default: true },
  choiceMaxQuantity: { type: Number, required: true, default: 1 },
  choiceDishType: { type: [String], enum: DishTypeEnum, required: false },
  uuid: { type: String, required: true },
});

const extraSchema = new mongoose.Schema<AddOnType>(
  {
    businessId: {
      type: ObjectId,
      required: true,
      index: true,
      ref: "Business",
    },
    name: {
      type: String,
      required: true,
    },

    compulsory: {
      type: Number,
      required: true,
      default: 0,
    },
    addOnMaxQuantity: {
      type: Number,
      required: true,
      default: 1,
    },
    choiceType: {
      type: String,
      enum: ChoiceTypeEnum,
    },

    choices: {
      type: [choicesSchema],
      required: true,
    },
    availability: {
      type: Boolean,
      required: true,
      default: true,
    },
    visibility: {
      type: Boolean,
      required: true,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const AddOn: Model<AddOnType> = mongoose.model<AddOnType>("addon", extraSchema);
export { AddOn };
