import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;
const orderIdSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: false,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      expires: 60 * 60 * 24, // 1 day in seconds
    },
  },
  {
    timestamps: false,
  },
);

const OrderIdTracker = mongoose.model("orderIdTracker", orderIdSchema);
export { OrderIdTracker };
