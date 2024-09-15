import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import {
  formatDiscount,
  getBestCouponSuggestion,
} from "@/components/utils/helpers";
import React, { useMemo } from "react";

const SuggestCouponz = () => {
  const { billValue } = usePaymentStore((s) => ({
    billValue: s.billValue,
  }));
  const { availedCoupon, missingOutCoupon } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    missingOutCoupon: s.missingOutCoupon,
  }));
  const { bestCoupon, additionalAmount } = useMemo(() => {
    return getBestCouponSuggestion(availedCoupon, missingOutCoupon, billValue);
  }, [availedCoupon, missingOutCoupon, billValue]);
  return (
    <>
      {availedCoupon && Object.keys(availedCoupon).length > 0 && bestCoupon && (
        <article className="inter h-8 px-6 absolute flex items-center w-full bg-[#6A31DF] bottom-12 rounded-t-xl border-t-1">
          {bestCoupon && (
            <p className="inter text-left text-xs font-semibold text-[#fff]">
              {additionalAmount > 0 ? (
                <>Add ₹ {additionalAmount} more to get </>
              ) : (
                <>You can get </>
              )}
              {formatDiscount(
                bestCoupon?.config?.value || 0,
                bestCoupon?.config?.discountType || "percentage",
              )}{" "}
              off on this bill with {bestCoupon?.name}
            </p>
          )}
        </article>
      )}
    </>
  );
};

export default SuggestCouponz;
