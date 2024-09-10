"use client";
import Image from "next/image";
import React, { memo, useCallback } from "react";
import { BiArrowBack } from "react-icons/bi";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { formatDiscount } from "@/components/utils/helpers";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";

const MemoApplyCouponz = () => {
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );

  const { billValue, setClaimCouponz, claimedCoinz, setClaimedCoinz } =
    usePaymentStore((s) => ({
      billValue: s.billValue,
      claimedCoinz: s.claimedCoinz,
      setClaimedCoinz: s.setClaimedCoinz,
      setClaimCouponz: s.setClaimCouponz,
    }));

  const { couponz } = useCouponz((s) => ({
    couponz: s.couponz,
  }));

  const { applyCouponz, setApplyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
    setApplyCouponz: s.setApplyCouponz,
  }));

  const toggleCouponz = useCallback(() => {
    setApplyCouponz(!applyCouponz);
  }, [applyCouponz]);

  const applyCoupon = useCallback((coupon) => {
    if (coupon?.config?.discountType?.toLowerCase() === "percentage") {
      const discountValue = Math.round(
        (coupon?.config?.value / 100) * billValue,
      );
      console.log("disc", discountValue);
      setClaimCouponz(discountValue);
      if (claimedCoinz > 0) {
        toast("Coupon Applied but coinz will be removed");
        setClaimedCoinz(0);
      }
    } else {
      setClaimCouponz(coupon?.config?.value);
      if (claimedCoinz > 0) {
        toast("Coupon Applied but coinz will be removed");
        setClaimedCoinz(0);
      }
    }
    setApplyCouponz(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    let audio: HTMLAudioElement;
    audio = new Audio("/sounds/Money.mp3");
    audio.play();
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  return (
    <main className="bg-[#F1F0F5] min-h-[100vh] h-full py-4 relative inter">
      <section className="fixed top-0 z-20 flex justify-between w-full gap-4 p-2 bg-white">
        <article className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleCouponz}
            className="py-2 rounded-full z-[60] px-4 text-black bg-[#ffffff70] border"
          >
            <BiArrowBack />
          </button>
          <article>
            <h1 className="text-lg text-black">Apply Couponz</h1>
            <p className="text-[10px] text-[#676769]">
              Bill Amount: ₹ {billValue}
            </p>
          </article>
        </article>
        <picture className="mr-6">
          <Image src={logoUrl} alt="logoUrl" width={44} height={44} />
        </picture>
      </section>
      <br />
      <br />
      <h1 className="m-4 text-xs font-bold text-black">
        Great deals you get on this billing
      </h1>
      {couponz?.map((coupon) => {
        return (
          <section
            key={coupon?._id}
            className="flex mx-4 my-4 rounded-2xl inter"
          >
            <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
              <div className="h-4 bg-[#9268EC] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
              <article className="flex items-center justify-between">
                <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                  {coupon?.name}
                </h1>
                <button
                  type="button"
                  onClick={() => applyCoupon(coupon)}
                  className="on_active_bounce text-[#9268EC] text-sm mt-1 font-bold"
                >
                  APPLY
                </button>
              </article>
              <div className="relative z-10 gap-2 px-1 mt-2">
                <div className="flex flex-col items-start space-y-1">
                  <p className="text-xs font-semibold text-[#00C37E]">
                    Get{" "}
                    {formatDiscount(
                      coupon?.config?.value,
                      coupon?.config?.discountType,
                    )}{" "}
                    off on this bill
                  </p>
                </div>
                <hr
                  className="w-full col-span-2 my-3 -mx-2"
                  style={{
                    backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                      "#000000",
                    )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: "3px",
                    border: "none",
                  }}
                />
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-xs text-[#858585]">
                    Use this coupon & get{" "}
                    {formatDiscount(
                      coupon?.config?.value,
                      coupon?.config?.discountType,
                    )}{" "}
                    off on bill above ₹ {coupon?.conditions?.billValue}. Maximum
                    discount: {coupon?.config?.upto}
                  </h3>
                </div>
              </div>
            </article>
          </section>
        );
      })}
      <h1 className="m-4 text-xs font-bold text-black">
        Coupons you are missing out
      </h1>
    </main>
  );
};

const ApplyCouponz = memo(MemoApplyCouponz);
export default ApplyCouponz;
