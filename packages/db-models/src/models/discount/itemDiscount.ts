import type { Model } from "mongoose";
import mongoose from "mongoose";
import type { ItemDiscountTypeValidator } from "../../validators";
const itemDiscountSchema = new mongoose.Schema<ItemDiscountTypeValidator>({
  itemId: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  date: {
    type: Number,
    required: true,
  },
});

const ItemDiscount: Model<ItemDiscountTypeValidator> =
  mongoose.model<ItemDiscountTypeValidator>("itemdiscount", itemDiscountSchema);
export { ItemDiscount };
