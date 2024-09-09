import React, { memo } from "react";
import Image from "next/image";
import Standsboards from "@/assets/img/Standboards.png";
import CouponzLight from "@/assets/img/couponzLight.png";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { adjustLightness, cn, colors } from "@/components/utils/helpers";

const MemoCouponzBlink = () => {
  const colorIndex = 2;
  const baseColor = colors[colorIndex]?.color;
  const bgColor = colors[colorIndex]?.bgColor;
  const darkerColor = adjustLightness(baseColor, 20);

  return (
    <article
      className="h-[400px] w-full rounded-2xl overflow-hidden max-w-[95%] mx-auto"
      style={{
        background: `linear-gradient(133.14deg, ${baseColor} 25.81%, ${darkerColor} 104.42%)`,
      }}
    >
      <Image src={Standsboards} alt="Standsboards" />
      <Image
        src={CouponzLight}
        alt="Couponz"
        className="absolute mt-4 top-12"
      />
      <Image
        src={CouponzLight}
        alt="Couponz"
        className="absolute mt-4 top-12 mix-blend-screen blink-effect"
      />
      <section className="flex overflow-x-auto flex-nowrap">
        <section className="inset-0 flex pl-4 ">
          <center className="relative ">
            <Image
              src={birthdayPlaceholder}
              alt="Birthday Placeholder"
              width={195}
              height={130}
              className="rounded-t-xl"
            />
            <hr
              className="absolute inset-0  w-full col-span-2 top-[8.4rem]"
              style={{
                backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                  baseColor,
                )}' stroke-width='4' stroke-dasharray='21%2c 15' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "2px",
                border: "none",
              }}
            />
            <div className="relative w-[12.188rem] min-h-[6rem] max-h-full z-10 text-black bg-white rounded-b-xl">
              <div className="absolute flex items-center justify-between w-full px-2">
                <div
                  className={cn(
                    bgColor,
                    "absolute w-[1.875rem] h-8 rounded-full -left-4",
                  )}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                  }}
                />
                <div
                  className={cn(
                    bgColor,
                    "absolute w-8 h-8 rounded-full -right-4",
                  )}
                  style={{
                    clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
                  }}
                />
              </div>
              <h1 className="w-full px-2 pt-4 text-sm bungee-inline">
                THE TASTY COFFEECUP BIRTHDAY BASH
              </h1>
              <p className="col-span-2 text-2xl text-center text-black space-grotesk-700">
                25% OFF
              </p>
            </div>
          </center>
        </section>
        <section className="inset-0 flex pl-4 ">
          <center className="relative ">
            <Image
              src={birthdayPlaceholder}
              alt="Birthday Placeholder"
              width={195}
              height={130}
              className="rounded-t-xl"
            />
            <hr
              // className="absolute inset-0  w-full col-span-2 top-[8.4rem]"
              className="bg-white"
              style={{
                backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                  baseColor,
                )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "2px",
                border: "none",
              }}
            />
            <div className="relative w-[12.188rem] min-h-[6rem] max-h-full z-10 text-black bg-white rounded-b-xl">
              <div className="absolute flex items-center justify-between w-full px-2">
                <div
                  className={cn(
                    bgColor,
                    "absolute w-[1.875rem] h-8 rounded-full -left-4",
                  )}
                  style={{
                    clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                  }}
                />
                <div
                  className={cn(
                    bgColor,
                    "absolute w-[1.875rem] h-8 rounded-full -right-4",
                  )}
                  style={{
                    clipPath: "polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)",
                  }}
                />
              </div>
              <h1 className="w-full px-2 pt-4 text-sm bungee-inline">
                THE TASTY COFFEECUP BIRTHDAY BASH
              </h1>
              <p className="col-span-2 text-2xl text-center text-black space-grotesk-700">
                25% OFF
              </p>
            </div>
          </center>
        </section>
      </section>
    </article>
  );
};

const CouponzBlink = memo(MemoCouponzBlink);
export default CouponzBlink;
