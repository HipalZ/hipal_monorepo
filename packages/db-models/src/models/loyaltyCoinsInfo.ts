import mongoose, { Model } from 'mongoose';
import { LoyaltyCoinsInfoType } from '../validators';
const loyaltyCoinsInfoSchema = new mongoose.Schema<LoyaltyCoinsInfoType>({
  businessId: { type: String, required: true },
  coinzIssued: { type: Number, required: true },
  coinzRedeemed: { type: Number, required: true },
  couponzIssued: { type: Number, required: false },
  couponzRedeemed: { type: Number, required: false },
});

const LoyaltyCoinsInfo: Model<LoyaltyCoinsInfoType> = mongoose.model<LoyaltyCoinsInfoType>('loyaltycoinsinfo', loyaltyCoinsInfoSchema);

export { LoyaltyCoinsInfo };
