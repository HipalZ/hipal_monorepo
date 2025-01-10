import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { memo, useCallback, useEffect, useMemo } from "react";

const MemoPaymentCard = () => {
  const {
    claimCouponz, claimedCoinz
  } = usePaymentStore();
  const offer = claimedCoinz || claimCouponz
  const { billValue, setShowBillPage } = usePaymentStore();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const finalBillValue = useMemo(() => {
    return offer >= billValue ? 0 : billValue - offer;
  }, [offer, billValue]);

  useEffect(() => {
    const starContainer = document.getElementById("star-container");
    if (starContainer) {
      for (let i = 0; i < 10; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        starContainer.appendChild(star);
      }
    }
  }, []);

  const handleRedirection = useCallback(() => {
    setShowBillPage(true);
  }, [setShowBillPage])

  return (
    <>
      {!outletInfo?.isPosEnabled ? <center className="relative mx-4 text-xl text-black bg-white rounded-xl">
        <div id="star-container" className="absolute inset-0 overflow-hidden" />
        <h4 className="pt-2 text-sm font-semibold">You Pay</h4>
        {offer > 0 ? (
          <h4 className="mt-1 text-4xl font-bold">₹ {finalBillValue}</h4>
        ) : null}
        <h4
          className={`${offer > 0 ? "line-through" : "text-4xl font-bold"} pb-2`}
        >
          <span
            className={`${offer > 0 ? "line-through" : "text-3xl font-bold"}`}
          >
            ₹
          </span>{" "}
          {billValue}
        </h4>
      </center> :
        <section className="relative">
          <center className="relative mx-4 text-xl py-6 bg-[#F4E9FD] rounded-2xl">
            {offer > 0 ? (
              <h4 className="mt-1 text-4xl font-bold text-[#200866]">₹ {finalBillValue}</h4>
            ) : null}
            <h4
              className={`text-[#200866] ${offer > 0 ? "line-through" : "text-4xl font-bold"} pb-2`}
            >
              <span
                className={`text-[#200866] ${offer > 0 ? "line-through" : "text-3xl font-bold"}`}
              >
                ₹
              </span>{" "}
              {billValue}
            </h4>
          </center>
          <article className="absolute text-center left-1/2 bottom-2 -translate-x-1/2 w-28 py-1 px-4 bg-[#6732F9] rounded-full">
            <button onClick={handleRedirection} type="button" className="text-base montserrat-400">View Bill</button>
          </article>
          <br />
        </section>
      }
    </>
  );
};

const PaymentCard = memo(MemoPaymentCard);
export default PaymentCard;
