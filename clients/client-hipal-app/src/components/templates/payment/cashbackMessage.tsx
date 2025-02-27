import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useCouponz } from "@/components/store/useCouponz";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { calculateReward } from "@/components/utils/helpers";
import React, { memo, useMemo } from "react";

const MemoCashbackMessage = () => {
  const { claimedCoins, billValue, tips, userCoinz, claimCouponz, billData } =
    usePaymentStore((s) => ({
      claimedCoins: s.claimedCoins,
      billValue: s.billValue,
      tips: s.tips,
      userCoinz: s.userCoinz,
      claimCouponz: s.claimCouponz,
      billData: s.billData,
    }));

  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  const { availedCoupon } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
  }));

  const { loyaltySetting } = useLoyaltyData((s) => ({
    loyaltySetting: s.loyaltySetting,
  }));

  const total = useMemo(
    () => billValue - claimedCoins - claimCouponz + tips,
    [billValue, claimedCoins, claimCouponz, tips],
  );

  const coinsObtained = useMemo(
    () => total * (loyaltySetting?.setCashBackPercentage / 100),
    [total, loyaltySetting?.setCashBackPercentage],
  );

  const existingCoins = useMemo(
    () => (claimedCoins ? userCoinz - claimedCoins : userCoinz),
    [claimedCoins, userCoinz],
  );

  const finalReward = useMemo(() => {
    if (outletInfo?.isPosEnabled) {
      return billData?.total * (loyaltySetting?.setCashBackPercentage / 100);
    }
    if (
      (availedCoupon?.cashbackAvailable && claimCouponz > 0) ||
      claimedCoins > 0 ||
      (claimedCoins > 0 && claimCouponz === 0)
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
    claimedCoins,
    existingCoins,
    coinsObtained,
    loyaltySetting?.rewardLimit,
    loyaltySetting?.setCashBackPercentage,
    outletInfo?.isPosEnabled,
    billData?.total,
  ]);

  return (
    <>
      {(claimedCoins > 0 || availedCoupon?.cashbackAvailable) && (
        <center className="relative">
          <h1 className="text-xs btn-shine">
            You will get {Math.round(finalReward)} on this bill
          </h1>
          <br />
        </center>
      )}
    </>
  );
};

const CashbackMessage = memo(MemoCashbackMessage);
export default CashbackMessage;
