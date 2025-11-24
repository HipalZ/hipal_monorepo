"use client";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo } from "react";

const MemoPaymentCard = () => {
  const searchParams = useSearchParams();
  const amountParam = searchParams?.get("amount");
  const parsedAmount = useMemo(() => Number(amountParam), [amountParam]);

  const claimCouponz = usePaymentStore((s) => s.claimCouponz);
  const claimedCoins = usePaymentStore((s) => s.claimedCoins);
  const billData = usePaymentStore((s) => s.billData);
  const billValue = usePaymentStore((s) => s.billValue);
  const setBillValue = usePaymentStore((s) => s.setBillValue);
  const setShowBillPage = usePaymentStore((s) => s.setShowBillPage);

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  // 🧮 Combine all discounts
  const totalDiscount = useMemo(() => {
    return (
      Number(billData?.discount || 0) +
      Number(billData?.couponDiscount || 0) +
      Number(billData?.claimedCoins || 0) +
      Number(claimCouponz || 0)
    );
  }, [billData, claimCouponz]);

  // 💰 Compute final payable
  const finalBillValue = useMemo(() => {
    const base = Number(billData?.subTotal || billValue || 0);
    return Math.max(0, base - totalDiscount);
  }, [billData, billValue, totalDiscount]);

  useEffect(() => {
    if (!Number.isNaN(parsedAmount) && parsedAmount > 0) {
      setBillValue(parsedAmount);
    }
  }, [parsedAmount, setBillValue]);

  const handleRedirection = useCallback(() => {
    setShowBillPage(true);
  }, [setShowBillPage]);

  const currency = outletInfo?.currencySymbol || "₹";
  const hasDiscount = totalDiscount > 0;

  return (
    <>
      {outletInfo?.isPosEnabled ? (
        <section className="relative">
          <center className="relative mx-4 text-xl py-6 bg-[#F4E9FD] rounded-2xl">
            {hasDiscount ? (
              <>
                <h4 className="text-lg -mt-3 font-semibold text-gray-500 line-through">
                  {currency} {(billData?.subTotal || 0).toFixed(2)}
                </h4>
                <h4 className="mt-1 text-4xl font-bold text-[#200866]">
                  {currency} {finalBillValue.toFixed(2)}
                </h4>
              </>
            ) : (
              <h4 className="mt-1 text-4xl font-bold text-[#200866]">
                {currency} {(billData?.subTotal || 0).toFixed(2)}
              </h4>
            )}
          </center>

          {Math.abs(billData?.subTotal - billData?.claimedCoins) > 0 && (
            <article className="absolute flex text-center left-1/2 -bottom-2 -translate-x-1/2 w-28 py-1 px-4 bg-[#6732F9] rounded-full h-8">
              <button
                onClick={handleRedirection}
                type="button"
                className="text-base montserrat-400 text-white"
              >
                View Bill
              </button>
            </article>
          )}
        </section>
      ) : (
        <center className="relative mx-4 text-xl text-black bg-white rounded-xl">
          <h4 className="pt-2 text-sm font-semibold">You Pay</h4>
          {hasDiscount && (
            <h4 className="text-3xl font-semibold text-gray-500 line-through">
              {currency} {billValue.toFixed(2)}
            </h4>
          )}
          <h4
            className={`pb-2 text-4xl font-bold ${
              hasDiscount ? "text-[#200866]" : "text-black"
            }`}
          >
            {currency} {finalBillValue.toFixed(2)}
          </h4>
        </center>
      )}
    </>
  );
};

const PaymentCard = memo(MemoPaymentCard);
export default PaymentCard;
