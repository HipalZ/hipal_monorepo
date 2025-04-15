import { Couponz } from "@hi/db-models";
import type { ClientSession } from "mongoose";

/* createBookingCoupon */
export const createBookingCoupon = async (
  businessId: string,
  name: string,
  discountType: "PERCENTAGE" | "AMOUNT",
  value: number,
  upto: number | undefined,
  meta: any,
  session: ClientSession,
) => {
  const coupon = await Couponz.create(
    [
      {
        businessId,
        name,
        type: "BOOKINGS",
        config: { value, discountType, upto },
        bookingMeta: meta,
      },
    ],
    { session },
  );
  return coupon[0];
};

/* updateBookingCoupon */
export const updateBookingCoupon = async (
  couponId: string,
  fields: Record<string, any>,
  session: ClientSession,
) => {
  const coupon = await Couponz.findOne({
    _id: couponId,
    isDeleted: false,
  }).session(session);
  if (!coupon) throw new Error("Coupon not found");
  if (coupon.type !== "BOOKINGS")
    throw new Error("Only BOOKINGS coupons can be updated");

  const map: Record<string, string> = {
    name: "name",
    discountType: "config.discountType",
    value: "config.value",
    upto: "config.upto",
    bookingMeta: "bookingMeta",
  };

  for (const [k, v] of Object.entries(map)) {
    if (fields[k] !== undefined) {
      coupon.set(v, fields[k]);
    }
  }
  await coupon.save({ session });
  return coupon;
};

/* archiveBookingCoupon */
export const archiveBookingCoupon = async (
  couponId: string,
  session: ClientSession,
) => {
  const coupon = await Couponz.findOne({
    _id: couponId,
    isDeleted: false,
  }).session(session);
  if (!coupon) throw new Error("Coupon not found");
  if (coupon.type !== "BOOKINGS")
    throw new Error("Only BOOKINGS coupons can be archived");
  coupon.isDeleted = true;
  await coupon.save({ session });
  return coupon;
};
