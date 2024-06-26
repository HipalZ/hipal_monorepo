import mongoose, { Model } from 'mongoose';
import { PaymentAlertType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const paymentAlertSchema = new mongoose.Schema<PaymentAlertType>({
  businessId: { type: ObjectId, required: true, ref: 'Business' },
  comment: { type: String, default: null },
  status: { type: String, default: null },
  completionCode: { type: Number, default: null },
  alertType: { type: String, enum: ['ONLINE', 'OFFLINE', 'WAITER'], required: true },
  order_id: { type: ObjectId, required: false, ref: 'Order' },
  payment_id: { type: ObjectId, default: null, ref: 'Payment' },
  isAccepted: { type: Boolean, default: false },
  message: { type: String, default: null },
  name: { type: String, default: null },
  isRejected: { type: Boolean, default: false },
  errorReason: { type: String, default: null },
  tableName: { type: String, required: true },
  errorDescription: { type: String, default: null },
  waiterName: { type: String, default: null },
  coinsApplied: { type: Boolean, default: false },
  date: { type: Number, default: Date.now() },
});

const PaymentAlert: Model<PaymentAlertType> = mongoose.model<PaymentAlertType>('PaymentAlert', paymentAlertSchema);

export { PaymentAlert };
