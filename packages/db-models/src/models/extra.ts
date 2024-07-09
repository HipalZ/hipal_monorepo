import mongoose, { type Model } from 'mongoose';
import type { ExtraType, ItemsType } from '../validators';

const itemSchema = new mongoose.Schema<ItemsType>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: false },
  visibility: { type: Boolean, required: true },
  maxQuantity: { type: Number, required: true },
  extraType: { type: String, required: false },
  id: { type: String, required: true },
});

const Item = mongoose.model('Item', itemSchema);

const extraSchema = new mongoose.Schema<ExtraType>(
  {
    businessId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    numOptions: {
      type: Number,
      required: true,
    },
    numSelections: {
      type: Number,
      required: true,
    },
    compulsory: {
      type: Number,
      required: true,
    },
    maxQuantity: {
      type: Number,
      required: true,
    },
    addOnType: {
      type: String,
    },

    items: {
      type: [itemSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Extra: Model<ExtraType> = mongoose.model<ExtraType>('Extra', extraSchema);
export { Extra };
