import useCouponsStore from "@/components/store/useCouponsStore";
import { memo, useCallback } from "react";
import AfterGrabbingCoupon from "./previewTypes/afterGrabbingCard";
import BottomButton from "@/components/atom/bottomButton";
import MinimumBillCondition from "./coditionChunk/minimumBillCondition";
import MaxUserClaimCondition from "./coditionChunk/maxUserClaimeCondition";
import DayRestrictionCondition from "./coditionChunk/dayRestrictionCondition";
import TimeRestrictionCondition from "./coditionChunk/timeRestrictionCondition";
import toast from "react-hot-toast";

const MemoAllConditions = () => {
  const {
    couponPrice,
    addMinimumBillAmount,
    minimumBillAmount,
    expiryClaimLimitValue,
    couponUserClaim,
    setSelectedPage,
    dayRestriction,
    customDays,
    timeBasedRestriction,
    startTime,
    endTime,
    extendedEndTime,
    allowLateNight,
  } = useCouponsStore((s) => ({
    couponPrice: s.couponPrice,
    addMinimumBillAmount: s.addMinimumBillAmount,
    minimumBillAmount: s.minimumBillAmount,
    expiryClaimLimitValue: s.expiryClaimLimitValue,
    couponUserClaim: s.couponUserClaim,
    setSelectedPage: s.setSelectedPage,
    dayRestriction: s.dayRestriction,
    customDays: s.customDays,
    timeBasedRestriction: s.timeBasedRestriction,
    startTime: s.startTime,
    endTime: s.endTime,
    extendedEndTime: s.extendedEndTime,
    allowLateNight: s.allowLateNight,
  }));

  const goNext = useCallback(() => {
    if (addMinimumBillAmount) {
      if (!minimumBillAmount || minimumBillAmount <= couponPrice) {
        toast.error(
          "Please enter a valid minimum bill amount greater than the coupon price.",
        );
        return;
      }
    }

    if (couponUserClaim) {
      if (!expiryClaimLimitValue || expiryClaimLimitValue <= 0) {
        toast.error("Please enter a valid maximum claim limit.");
        return;
      }
    }

    if (dayRestriction) {
      if (!customDays || customDays.length === 0) {
        toast.error("Please select at least one day for day restriction.");
        return;
      }
    }
    if (timeBasedRestriction) {
      if (!startTime || !endTime) {
        toast.error("Please select both start time and end time.");
        return;
      }
      if (endTime <= startTime) {
        toast.error("End time should be greater than start time.");
        return;
      }
      if (allowLateNight && (!extendedEndTime || extendedEndTime <= endTime)) {
        toast.error(
          "Please enter a valid extended end time greater than the end time.",
        );
        return;
      }
    }

    // If all validations pass, proceed to the next page
    setSelectedPage("PREVIEW");
  }, [
    addMinimumBillAmount,
    minimumBillAmount,
    couponPrice,
    couponUserClaim,
    expiryClaimLimitValue,
    dayRestriction,
    customDays,
    timeBasedRestriction,
    startTime,
    endTime,
    extendedEndTime,
    allowLateNight,
    setSelectedPage,
  ]);
  return (
    <section className="flex flex-col items-center pb-[5rem] justify-center gap-4 mx-6 lg:items-start lg:flex-row lg:mx-0 ">
      {" "}
      <section className="flex-2">
        <AfterGrabbingCoupon />
      </section>
      <section className="grid flex-1 w-full grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-2">
        <MinimumBillCondition />
        <MaxUserClaimCondition />
        <DayRestrictionCondition />
        <TimeRestrictionCondition />
      </section>
      <BottomButton
        buttons={[
          {
            text: "Back",
            onClick: () => setSelectedPage("DETAILS"),
          },
          {
            text: "Next",
            onClick: goNext,
          },
        ]}
        fixed
      />
    </section>
  );
};

const AllConditions = memo(MemoAllConditions);
export default AllConditions;
