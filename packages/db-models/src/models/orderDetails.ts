import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import type { OrderDetailsType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;
const orderDetailsSchema = new mongoose.Schema<OrderDetailsType>({
  order_id: { type: ObjectId, required: true, ref: 'Order' },
  payment_id: { type: ObjectId, required: true, ref: 'Payment' },
  date: { type: Number, required: true, default: Date.now() },
});

const OrderDetails: Model<OrderDetailsType> = mongoose.model<OrderDetailsType>('OrderDetail', orderDetailsSchema);

export { OrderDetails };
