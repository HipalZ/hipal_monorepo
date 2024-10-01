import React, { memo } from "react";
import Image from "next/image";
import Sunrays from "@/assets/img/sunrays_white.png";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { cn, formatDiscount } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import ShimmerImage from "../imageshimmer";

const MemoCouponCardCongrats = () => {
  const { selectedCoupon } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
  }));
  return (
    <section className="absolute inset-0 flex items-center justify-center shadow-2xl">
      <center className="absolute w-[800px] z-0">
        <Image
          className="opacity-50 animate-spin"
          width={1080}
          height={1080}
          src={Sunrays}
          alt="SunlightReview"
        />
      </center>
      <center className="relative z-50 w-64">
        <ShimmerImage
          src={selectedCoupon?.image || birthdayPlaceholder}
          alt="Birthday Placeholder"
          width={256}
          height={180}
          className="rounded-t-xl bg-[#e0dbdb]"
          style={{
            objectFit: "cover",
            maxHeight: "200px",
            maxWidth: "287px",
          }}
        />
        <hr
          className="bg-white"
          style={{
            backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
              selectedCoupon?.bgColour || "#9267EC",
            )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "2px",
            border: "none",
          }}
        />
        <div className="relative min-h-[7rem] max-h-full z-10 text-black bg-white rounded-b-xl">
          <div className="absolute flex items-center justify-between w-full px-2">
            <div
              className={cn(
                `bg-[${selectedCoupon?.bgColour}]`,
                "absolute w-8 h-8 rounded-full -left-4",
              )}
              style={{
                clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
              }}
            />
            <div
              className={cn(
                `bg-[${selectedCoupon?.bgColour}]`,
                "absolute w-8 h-8 rounded-full -right-4",
              )}
              style={{
                clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
              }}
            />
          </div>
          <h1 className="w-full px-4 pt-4 text-xl bungee-inline">
            {selectedCoupon?.name}
          </h1>
          <p className="col-span-2 p-4 text-4xl text-center text-black space-grotesk-700">
            {formatDiscount(
              selectedCoupon?.config?.value,
              selectedCoupon?.config?.discountType,
            )}
            OFF
          </p>
        </div>
      </center>
    </section>
  );
};

const CouponCardCongrats = memo(MemoCouponCardCongrats);
export default CouponCardCongrats;
