"use client";
import Image from "next/image";
import React, { memo, useEffect, useState } from "react";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { cn } from "@hi/common";
import { colors } from "@/components/utils/helpers";

const payload = {
  billValue: 1000,
  startTime: 15,
  endTime: 24,
  customDays: ["monday", "tuesday"],
  couponStartDate: 1725090918272,
  couponEndDate: 1725259809706,
};

const MemoCouponCardPay = () => {
  const [colorIndex, setColorIndex] = useState(0);

  return (
    <section className="relative">
      <center
        style={{ transform: "rotate(-10deg)", transformOrigin: "bottom right" }}
        className="absolute h-[7.5rem] w-full"
      >
        <Image
          src={birthdayPlaceholder}
          alt="Birthday Placeholder"
          className="object-fill w-full rounded-t h-[5rem]"
        />
        <div className="relative z-10 grid w-full grid-cols-2 px-1 pt-2 -mt-px text-black bg-white rounded-b">
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Min. Bill Amount</h3>
            <p className="text-[0.3rem]">₹{payload?.billValue}</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Valid Till</h3>
            <p className="text-[0.3rem]">18 Aug 2024</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Applicable On</h3>
            <p className="text-[0.3rem]">M, Tue, Wed</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Available On</h3>
            <p className="text-[0.3rem]">04:00-20:00</p>
          </div>
          <hr
            className="w-full col-span-2 my-1"
            style={{
              backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                colors[colorIndex]?.color,
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "1px",
              border: "none",
            }}
          />
          <p className="col-span-2 mb-2 text-sm text-center text-black space-grotesk-700">
            25% OFF
          </p>
          <div className="absolute flex items-center justify-between w-full h-full px-2">
            <div
              className={cn(
                colors[colorIndex]?.bgColor,
                "absolute w-2 h-2 rounded-full -left-1 bottom-7",
              )}
            />
            <div
              className={cn(
                colors[colorIndex]?.bgColor,
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
      <center className="absolute h-[10rem] w-full">
        <Image
          src={birthdayPlaceholder}
          alt="Birthday Placeholder"
          className="rounded-t h-[4.5rem] w-full object-fill z-20"
        />
        <div className="relative z-20 grid w-full grid-cols-2 px-1 pt-2 -mt-px text-black bg-white rounded-b">
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Min. Bill Amount</h3>
            <p className="text-[0.3rem]">₹{payload?.billValue}</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Valid Till</h3>
            <p className="text-[0.3rem]">18 Aug 2024</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Applicable On</h3>
            <p className="text-[0.3rem]">M, Tue, Wed</p>
          </div>
          <div className="flex flex-col items-start space-y-0.5 my-0.5">
            <h3 className="text-gray-500 text-[0.25rem]">Available On</h3>
            <p className="text-[0.3rem]">04:00-20:00</p>
          </div>
          <hr
            className="w-full col-span-2 my-1"
            style={{
              backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                colors[colorIndex]?.color,
              )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "1px",
              border: "none",
            }}
          />
          <p className="col-span-2 mb-2 text-sm text-center text-black space-grotesk-700">
            25% OFF
          </p>
          <div className="absolute flex items-center justify-between w-full h-full px-2">
            <div
              className={cn(
                colors[colorIndex]?.bgColor,
                "absolute w-2 h-2 rounded-full -left-1 bottom-7",
              )}
            />
            <div
              className={cn(
                colors[colorIndex]?.bgColor,
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
