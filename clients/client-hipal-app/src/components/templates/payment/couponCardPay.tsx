"use client";
import Image from "next/image";
import React, { memo } from "react";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { cn } from "@hi/common";
import {
  formatDate,
  formatDiscount,
  formatTime,
  getAvailabilityText,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";

const MemoCouponCardPay = () => {
  const { couponz, availedCoupon } = useCouponz((s) => ({
    couponz: s.couponz,
    availedCoupon: s.availedCoupon,
  }));

  const { claimCouponz } = usePaymentStore((s) => ({
    claimCouponz: s.claimCouponz,
  }));

  return (
    <section className="relative max-h-[6rem]">
      {claimCouponz === 0 && (
        <center
          style={{
            transform: "rotate(-18deg)",
            transformOrigin: "bottom center",
          }}
          className="absolute max-h-[8rem] max-w-[8rem] scale-110"
        >
          <picture className="w-full">
            <Image
              src={claimCouponz > 0 ? couponz[1]?.image : birthdayPlaceholder}
              width={100}
              height={96}
              alt="Birthday Placeholder"
              style={{
                objectFit: "contain",
                height: "3.375rem",
                width: "5rem",
              }}
            />
          </picture>
          <div
            style={{
              height: "auto",
              maxHeight: "6rem",
              width: "5rem",
            }}
            className="relative z-20 grid w-full grid-cols-2 px-1 pt-2 -mt-px text-black bg-white rounded-b"
          >
            <div className="flex flex-col items-start space-y-0.5 my-0.5">
              <h3 className="text-gray-500 text-[0.25rem]">Min. Bill Amount</h3>
              <p className="text-[0.3rem]">
                ₹{couponz[1]?.conditions?.billValue || 1000}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-0.5 my-0.5">
              <h3 className="text-gray-500 text-[0.25rem]">Valid Till</h3>
              <p className="text-[0.3rem]">
                {formatDate(
                  couponz[1]?.conditions?.couponEndDate || new Date(),
                )}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-0.5 my-0.5">
              <h3 className="text-gray-500 text-[0.25rem]">Applicable On</h3>
              <p className="text-[0.3rem] text-left">
                {getAvailabilityText(
                  couponz[1]?.conditions?.availability?.when || "all",
                  couponz[1]?.conditions?.availability?.customDays || [],
                ).map((text, index, array) => (
                  <React.Fragment key={text}>
                    {text}
                    {index + 1 !== array.length && ","}
                    {(index + 1) % 3 === 0 && index + 1 !== array.length && (
                      <br />
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div className="flex flex-col items-start space-y-0.5 my-0.5">
              <h3 className="text-gray-500 text-[0.25rem]">Available On</h3>
              <p className="text-[0.3rem]">
                {formatTime(
                  couponz[1]?.conditions?.availability?.startTime || 1,
                )}
                -
                {formatTime(
                  couponz[1]?.conditions?.availability?.endTime || 23.5,
                )}
              </p>
            </div>
            <hr
              className="w-full col-span-2 my-1"
              style={{
                backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                  `${couponz[0]?.bgColour || "#FFC93C"}`,
                )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "1px",
                border: "none",
              }}
            />
            <p className="col-span-2 mb-2 text-sm text-center text-black space-grotesk-700">
              {formatDiscount(
                couponz[1]?.config?.value || 10,
                couponz[1]?.config?.discountType || "percentage",
              )}{" "}
              OFF
            </p>
            <div className="absolute flex items-center justify-between w-full h-full px-2">
              <div
                className={cn(
                  "bg-[#fff}]",
                  "absolute w-2 h-2 rounded-full -left-1 bottom-7",
                )}
              />
              <div
                className={cn(
                  `bg-["#fff"}]`,
                  "absolute w-2 h-2 rounded-full -right-1 bottom-7",
                )}
              />
            </div>
          </div>
          <div
            className="absolute w-3/4 h-8 transform -translate-x-1/2 bg-black opacity-75 left-1/2 -bottom-5"
            style={{ filter: "blur(30px)" }}
          />
        </center>
      )}
      <center className="absolute">
        <picture>
          <Image
            src={claimCouponz > 0 ? availedCoupon?.image : birthdayPlaceholder}
            width={100}
            height={53}
            alt="Birthday Placeholder"
            className="bg-black rounded-t"
            style={{ objectFit: "contain", height: "54px", width: "80px" }}
          />
        </picture>
        <div
          style={{
            height: "auto",
            maxHeight: "6rem",
            width: "5rem",
          }}
          className="relative z-10 grid w-full grid-cols-2 px-1 pt-2 -mt-px text-black bg-white rounded-b"
        >
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Min. Bill Amount</h3>
            <p className="text-[0.3rem]">
              ₹
              {claimCouponz > 0
                ? availedCoupon?.conditions?.billValue
                : couponz[0]?.conditions?.billValue || 1000}
            </p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Valid Till</h3>
            <p className="text-[0.3rem]">
              {formatDate(couponz[0]?.conditions?.couponEndDate || new Date())}
            </p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Applicable On</h3>
            <p className="text-[0.3rem] text-left">
              {getAvailabilityText(
                couponz[0]?.conditions?.availability?.when || "all",
                couponz[0]?.conditions?.availability?.customDays || [],
              ).map((text, index, array) => (
                <React.Fragment key={text}>
                  {text}
                  {index + 1 !== array.length && ","}
                  {(index + 1) % 3 === 0 && index + 1 !== array.length && (
                    <br />
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Available On</h3>
            <p className="text-[0.3rem]">
              {formatTime(couponz[0]?.conditions?.availability?.startTime || 1)}
              -
              {formatTime(
                couponz[0]?.conditions?.availability?.endTime || 23.5,
              )}
            </p>
          </div>
          <hr
            className="w-full col-span-2 my-1"
            style={{
              backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                "#FFC93C",
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "1px",
              border: "none",
            }}
          />
          <p className="col-span-2 mb-2 text-sm text-center text-black space-grotesk-700">
            {formatDiscount(
              claimCouponz > 0
                ? availedCoupon?.config?.value
                : couponz[0]?.config?.value || 10,
              claimCouponz > 0
                ? availedCoupon?.config?.discountType
                : couponz[0]?.config?.discountType || "percentage",
            )}{" "}
            OFF
          </p>
          <div className="absolute flex items-center justify-between w-full h-full px-2">
            <div
              className={cn(
                "bg-[#FFC93C]",
                "absolute w-2 h-2 rounded-full -left-1 bottom-7",
              )}
            />
            <div
              className={cn(
                "bg-[#FFC93C]",
                "absolute w-2 h-2 rounded-full -right-1 bottom-7",
              )}
            />
          </div>
        </div>
        <div
          className="absolute w-3/4 h-8 transform -translate-x-1/2 bg-black opacity-75 left-1/2 -bottom-5"
          style={{ filter: "blur(30px)" }}
        />
      </center>
    </section>
  );
};

const CouponCardPay = memo(MemoCouponCardPay);
export default CouponCardPay;
