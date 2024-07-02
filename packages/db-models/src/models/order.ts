import mongoose, { Model } from 'mongoose';
import { OrderType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema<OrderType>(
  {
    businessId: { type: ObjectId, required: true, ref: 'Business', index: true },
    total: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true },
    billValue: { type: Number, required: true },
    receipt: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    tips: { type: Number, default: 0 },
    claimedCoins: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    order_id: { type: String, required: true },
    tableName: { type: String, default: null },
    date: { type: Number, required: false },
  },
  {
    timestamps: true,
  },
);

const Order: Model<OrderType> = mongoose.model<OrderType>('Order', orderSchema);

export { Order };
