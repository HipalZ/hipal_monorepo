"use client";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo } from "react";

const MemoPaymentCard = () => {
  const searchParams = useSearchParams();
  const amountParam = searchParams?.get("amount");
  const parsedAmount = useMemo(() => Number(amountParam), [amountParam]);

  const {
    claimCouponz,
    claimedCoins,
    billData,
    billValue,
    setBillValue,
    setShowBillPage,
  } = usePaymentStore();

  const offer = claimedCoins || claimCouponz;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const finalBillValue = useMemo(() => {
    return offer >= billValue ? 0 : billValue - offer;
  }, [offer, billValue]);

  // 👇 Set billValue if amount is provided
  useEffect(() => {
    if (!Number.isNaN(parsedAmount) && parsedAmount > 0) {
      setBillValue(parsedAmount);
    }
  }, [parsedAmount, setBillValue]);

  const handleRedirection = useCallback(() => {
    setShowBillPage(true);
  }, [setShowBillPage]);

  return (
    <>
      {outletInfo?.isPosEnabled ? (
        <section className="relative">
          <center className="relative mx-4 text-xl py-6 bg-[#F4E9FD] rounded-2xl">
            <h4 className="mt-1 text-4xl font-bold text-[#200866]">
              ₹{" "}
              {Math.max(
                0,
                Number(billData?.subTotal ?? 0) -
                  Number(billData?.claimedCoins ?? 0),
              )}
            </h4>
          </center>
          {Math.abs(billData?.subTotal - billData?.claimedCoins) > 0 && (
            <article className="absolute text-center left-1/2 bottom-2 -translate-x-1/2 w-28 py-1 px-4 bg-[#6732F9] rounded-full">
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
          <div
            id="star-container"
            className="absolute inset-0 overflow-hidden"
          />
          <h4 className="pt-2 text-sm font-semibold">You Pay</h4>
          {offer > 0 && (
            <h4 className="mt-1 text-4xl font-bold">₹ {finalBillValue}</h4>
          )}
          <h4
            className={`pb-2 ${
              offer > 0 ? "line-through" : "text-4xl font-bold"
            }`}
          >
            <span
              className={`${offer > 0 ? "line-through" : "text-3xl font-bold"}`}
            >
              ₹
            </span>{" "}
            {billValue}
          </h4>
        </center>
      )}
    </>
  );
};

const PaymentCard = memo(MemoPaymentCard);
export default PaymentCard;
