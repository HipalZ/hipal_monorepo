import { CouponModel } from '@hi/db-models';
import type { ClientSession } from 'mongoose';

export const createCoupon = async (businessId: string, name: string, discountPercentage: number, maxDiscountValue: number, session?: ClientSession) => {
  const coupon = new CouponModel({ businessId, name, discountPercentage, maxDiscountValue });
  await coupon.save({ session });
  return coupon;
};
export const updateCoupon = async (couponId: string, updatedFields: Record<string, any>, session?: ClientSession) => {
  const coupon = await CouponModel.findByIdAndUpdate(couponId, { $set: updatedFields }, { new: true, session });
  if (!coupon) throw new Error(`Coupon with ID ${couponId} not found.`);
  return coupon;
};
export const archiveCoupon = async (couponId: string, session?: ClientSession) => {
  const coupon = await CouponModel.findByIdAndUpdate(couponId, { archived_at: new Date() }, { new: true, session });
  if (!coupon) throw new Error(`Coupon with ID ${couponId} not found.`);
  return coupon;
};
