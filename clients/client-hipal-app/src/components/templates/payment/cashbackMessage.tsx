import { useCouponz } from "@/components/store/useCouponz";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { calculateReward } from "@/components/utils/helpers";
import React, { memo, useMemo } from "react";

const MemoCashbackMessage = () => {
  const { claimedCoinz, billValue, tips, userCoinz, claimCouponz } =
    usePaymentStore((s) => ({
      claimedCoinz: s.claimedCoinz,
      billValue: s.billValue,
      tips: s.tips,
      userCoinz: s.userCoinz,
      claimCouponz: s.claimCouponz,
    }));

  const { availedCoupon } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
  }));

  const { loyaltySetting } = useLoyaltyData((s) => ({
    loyaltySetting: s.loyaltySetting,
  }));

  const total = useMemo(
    () => billValue - claimedCoinz - claimCouponz + tips,
    [billValue, claimedCoinz, claimCouponz, tips],
  );

  const coinsObtained = useMemo(
    () => total * (loyaltySetting?.setCashBackPercentage / 100),
    [total, loyaltySetting?.setCashBackPercentage],
  );

  const existingCoins = useMemo(
    () => (claimedCoinz ? userCoinz - claimedCoinz : userCoinz),
    [claimedCoinz, userCoinz],
  );

  const finalReward = useMemo(() => {
    if (
      (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
      claimedCoinz > 0 ||
      (claimedCoinz > 0 && claimCouponz === 0)
    ) {
      return calculateReward(
        existingCoins,
        coinsObtained,
        loyaltySetting?.rewardLimit,
      )?.finalReward;
    }
    return 0;
  }, [
    availedCoupon,
    claimCouponz,
    claimedCoinz,
    existingCoins,
    coinsObtained,
    loyaltySetting?.rewardLimit,
  ]);

  return (
    <center className="relative my-4">
      {(claimedCoinz > 0 || availedCoupon?.cashbackAvailable) && (
        <h1 className="text-xs btn-shine">
          You will get {Math.round(finalReward)} on this bill
        </h1>
      )}
    </center>
  );
};

const CashbackMessage = memo(MemoCashbackMessage);
export default CashbackMessage;
