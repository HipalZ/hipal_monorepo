import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const tempSchema = new mongoose.Schema({
  businessId: { type: ObjectId, required: true, ref: 'Business', index: true },
  total: { type: Number, required: true },
  currency: { type: String, required: false },
  billValue: { type: Number, required: true },

  tips: { type: Number, default: 0 },
  claimedCoins: { type: Number, default: 0 },

  tableName: { type: String, required: true },
  date: { type: Number, required: true, default: Date.now() },
});

const TempBill = mongoose.model('tempBill', tempSchema);

export { TempBill };
