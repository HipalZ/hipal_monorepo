import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import {
  formatDiscount,
  getBestCouponSuggestion,
} from "@/components/utils/helpers";
import React, { memo, useEffect, useMemo } from "react";

const MemoSuggestCouponz = () => {
  const { billValue } = usePaymentStore((s) => ({
    billValue: s.billValue,
  }));

  const { availedCoupon, missingOutCoupon, updateCoupons } = useCouponz(
    (s) => ({
      availedCoupon: s.availedCoupon,
      missingOutCoupon: s.missingOutCoupon,
      updateCoupons: s.updateCoupons,
    }),
  );

  useEffect(() => {
    updateCoupons(billValue);
  }, [billValue, availedCoupon]);

  const { bestCoupon, additionalAmount } = useMemo(() => {
    return getBestCouponSuggestion(availedCoupon, missingOutCoupon, billValue);
  }, [availedCoupon, missingOutCoupon, billValue]);

  return (
    <>
      {availedCoupon && Object.keys(availedCoupon).length > 0 && bestCoupon && (
        <article className="fixed bottom-16 py-1 w-full inter px-6 flex items-center bg-[#6A31DF] rounded-t-2xl border-t-1">
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

const SuggestCouponz = memo(MemoSuggestCouponz);
export default SuggestCouponz;
