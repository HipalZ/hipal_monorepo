import {
  LoyaltySettings,
  OutLetInfo,
  UserReward,
  UserRewardHistory,
} from "@hi/db-models";
import type { ClientSession } from "mongoose";

export const calculateCoinDiscountOnBill = async (
  businessId: string,
  totalBill: number,
  appliedCoins: number,
) => {
  const outLetInfo = await OutLetInfo.findOne({ businessId }).select(
    "serviceChargePercentage gstPercentage",
  );

  if (!outLetInfo) {
    return 0;
  }

  const billValue = totalBill; // bill value
  const serviceChargePercentage =
    (outLetInfo.serviceChargePercentage || 0) / 100; // service charge
  const gstPercentage = (outLetInfo.gstPercentage || 5) / 100; // tax charge
  const coins = appliedCoins; // coins
  const finalBillValue = billValue - coins;

  const estimatedSubTotal =
    billValue / (1 + gstPercentage + serviceChargePercentage);

  const discount = Math.round(
    Math.abs(
      finalBillValue / (1 + gstPercentage + serviceChargePercentage) -
        estimatedSubTotal,
    ),
  );

  return discount;
};

export const computeRewardWithLimit = async (
  exist: number,
  reward: number,
  limit: number,
) => {
  const total = exist + reward;
  const sum = Math.min(total, limit);
  const finalReward = Math.round(Math.abs(sum - exist));
  return { finalReward, curentBalance: sum };
};

//

export const logRewardAddition = async (
  status: string,
  loyaltyId: string,
  orderId: string,
  userId: string,
  addCoins: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userId: userId,
        rewards: addCoins,
        status: status,
        orderId,
        loyaltyId,
        date: Date.now(),
      },
    ],
    { session },
  );

  return data;
};
//
export const logRewardDeduction = async (
  status: string,
  loyaltyId: string,
  orderId: string,
  userId: string,
  addCoins: number,
  session: ClientSession,
) => {
  const data = await UserRewardHistory.create(
    [
      {
        userId: userId,
        rewards: addCoins,
        status: status,
        orderId,
        loyaltyId,
        date: Date.now(),
      },
    ],
    { session },
  );

  return data;
};
export const deductUserCoins = async (
  claimedCoins: number,
  loyaltyId: string,
  orderId: string,
  userId: string,
  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });
  if (existingUser && existingUser.rewards >= claimedCoins) {
    const updatedReward = await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: -claimedCoins },
      },
      { new: true, session },
    );

    await logRewardDeduction(
      "MINUS",
      loyaltyId,
      orderId,
      userId,
      claimedCoins,
      session,
    );

    return updatedReward;
  }
  return null;
};

export const creditUserCoins = async (
  coins: number,
  userId: string,
  orderId: string,
  businessId: string,

  loyaltyId: string,

  session: ClientSession,
) => {
  const existingUser = await UserReward.findOne({ userId, loyaltyId });

  const existingLoyalty = await LoyaltySettings.findOne({
    businessId: businessId,
    isActive: true,
  });
  if (existingUser && existingLoyalty) {
    const coinsCalculated = await computeRewardWithLimit(
      existingUser.rewards,
      coins,
      existingLoyalty?.rewardLimit as number,
    );

    await UserReward.findOneAndUpdate(
      { userId, loyaltyId },
      {
        $inc: { rewards: coinsCalculated.finalReward },
      },
      { new: true, session },
    );

    if (coinsCalculated.finalReward > 0) {
      await logRewardAddition(
        "PLUS",
        loyaltyId,
        orderId,
        userId,
        coinsCalculated.finalReward,
        session,
      );
    }

    return coinsCalculated.finalReward || 0;
  }
  return 0;
};

export const calculateCashbackCoins = async (
  businessId: string,
  billValue: number,
  claimedCoins: number,
  couponDiscount: number,
  discount: number,
) => {
  const LoyaltySetting = await LoyaltySettings.findOne({
    businessId,
    isActive: true,
  }).select("rewardLimit setCashBackPercentage");

  if (!LoyaltySetting) {
    console.error("LoyaltySetting not found or setReward is not a number");
    return 0; // Or handle this case as appropriate for your application
  }
  const subTotal = billValue - claimedCoins - couponDiscount - discount;
  const coinsToBeAdded =
    (LoyaltySetting.setCashBackPercentage / 100) * subTotal;
  if (coinsToBeAdded < 0) {
    return 0;
  }
  return Math.round(coinsToBeAdded);
};
