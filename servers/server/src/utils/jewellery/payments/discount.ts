import { JewelleryOrder } from "@hi/db-models";
import type { ClientSession } from "mongoose";

async function recalcAndUpdateTotal(
  orderId: string,
  session: ClientSession,
  overrides: Partial<{
    claimedCoins: number;
    isCoinApplied: boolean;
    coinsAppliedPercent: number;
    couponId: string | null;
    couponDiscount: number;
    isCouponApplied: boolean;
    couponAppliedPercent: number;
    tips: number;
    isTipsApplied: boolean;
    tipsAppliedPercent: number;
  }> = {},
) {
  const order = await JewelleryOrder.findById(orderId).session(session);
  if (!order) return null;

  const subTotal = order.subTotal ?? 0;

  // Respect overrides or fallback to existing values
  const claimedCoins = overrides.claimedCoins ?? order.claimedCoins ?? 0;
  const couponDiscount = overrides.couponDiscount ?? order.couponDiscount ?? 0;
  const tips = overrides.tips ?? order.tips ?? 0;

  // Ensure no negatives
  const finalTotal = Math.max(
    0,
    subTotal - claimedCoins - couponDiscount + tips,
  );

  await JewelleryOrder.updateOne(
    { _id: orderId },
    {
      $set: {
        ...overrides,
        total: finalTotal,
      },
    },
    { session },
  );

  return { finalTotal };
}

export { recalcAndUpdateTotal };
