import React, { memo } from "react";
import Image from "next/image";
import Standsboards from "@/assets/img/Standboards.png";
import CouponzLight from "@/assets/img/couponzLight.png";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import {
  adjustLightness,
  cn,
  formatDiscount,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import EmblaCarousel2 from "@/components/atoms/emblaCarousel/emblaCarousel2";

const MemoCouponzBlink = () => {
  const { couponz } = useCouponz((s) => ({
    couponz: s.couponz,
  }));
  return (
    <article
      className="h-[400px] w-full rounded-2xl overflow-hidden max-w-[95%] mx-auto"
      style={{
        background: `linear-gradient(133.14deg, ${
          couponz[0]?.bgColour
        } 25.81%, ${adjustLightness(couponz[0]?.bgColour, 20)} 104.42%)`,
      }}
    >
      <Image src={Standsboards} alt="Standsboards" />
      <Image
        src={CouponzLight}
        alt="Couponz"
        className="absolute w-[95%] mt-4 top-12"
      />
      <Image
        src={CouponzLight}
        alt="Couponz"
        className="absolute w-[95%] mt-4 top-12 mix-blend-screen blink-effect"
      />
      <section className="relative flex flex-col items-center justify-center">
        <EmblaCarousel2 customCarousel={true}>
          {couponz?.map((coupon) => (
            <center key={coupon?._id}>
              <Image
                src={coupon?.image || birthdayPlaceholder}
                alt="Birthday Placeholder"
                width={195}
                height={130}
                className="bg-black rounded-t-xl"
                style={{
                  objectFit: "contain",
                  height: "8.125rem",
                  width: "12.2rem",
                }}
              />
              <hr
                className="bg-white"
                style={{
                  backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                    `${coupon?.bgColour || "#9267EC"}`,
                  )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  height: "2px",
                  border: "none",
                }}
              />
              <div className="relative w-[12.188rem] min-h-[5.5rem] max-h-full z-10 text-black bg-white rounded-b-xl">
                <div className="absolute flex items-center justify-between w-full px-2">
                  <div
                    className={cn(
                      `bg-[${coupon?.bgColour || "#9267EC"}]`,
                      "absolute w-[1.875rem] h-8 rounded-full -left-4",
                    )}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                    }}
                  />
                  <div
                    className={cn(
                      `bg-[${coupon?.bgColour || "#9267EC"}]`,
                      "absolute w-8 h-8 rounded-full -right-4",
                    )}
                    style={{
                      clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
                    }}
                  />
                </div>
                <h1 className="w-full px-2 pt-4 mb-2 text-sm bungee-inline">
                  {coupon?.name}
                </h1>
                <p className="col-span-2 mb-2 text-2xl text-center text-black space-grotesk-700">
                  {formatDiscount(
                    coupon?.config?.value,
                    coupon?.config?.discountType,
                  )}{" "}
                  OFF
                </p>
              </div>
            </center>
          ))}
        </EmblaCarousel2>
      </section>
    </article>
  );
};

const CouponzBlink = memo(MemoCouponzBlink);
export default CouponzBlink;
