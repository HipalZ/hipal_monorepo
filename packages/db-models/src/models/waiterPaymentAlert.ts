import mongoose from 'mongoose';
import { WaiterPaymentAlertType } from '../validators';
const ObjectId = mongoose.Schema.Types.ObjectId;

const waiterPaymentAlertSchema = new mongoose.Schema<WaiterPaymentAlertType>({
  businessId: { type: ObjectId, required: true, ref: 'Business' },

  tableName: { type: String, default: null },
  alertType: { type: String, enum: ['ONLINE', 'OFFLINE'], required: true },
  order_id: { type: ObjectId, required: true, ref: 'Order' },
  message: { type: String, default: null },
  payment_id: { type: ObjectId, default: null, ref: 'Payment' },
  isAccepted: { type: Boolean, default: false },
  date: { type: Number, default: Date.now },
});

const WaiterPaymentAlert = mongoose.model('WaiterPaymentAlert', waiterPaymentAlertSchema);

export default WaiterPaymentAlert;
