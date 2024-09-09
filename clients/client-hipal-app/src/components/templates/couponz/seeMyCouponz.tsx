"use client";
import React, { memo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { formatDate, formatTime } from "@/components/utils/helpers";

const MemoSeeMyCouponz = () => {
  const customLink = useParams()?.businessId as string;
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );
  const seeCouponz = [
    {
      _id: "1",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "2",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "3",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "4",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "5",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "6",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "7",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "8",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: ["monday", "tuesday"],
        startTime: 15,
        endTime: 24,
      },
      image: "",
    },
    {
      _id: "9",
      name: "The Best Tasteful coffeecup bash",
      config: {
        type: "FIX",
      },
      billValue: 60,
      couponEndDate: 1725259809706,
      availability: {
        customDays: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        startTime: 15.3,
        endTime: 24,
      },
      image: "",
    },
  ];
  const splitDecimalTime = (decimalTime) => {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);
    return { hours, minutes };
  };
  return (
    <main className="bg-[#F1F0F5] min-h-[100vh] h-full py-4 relative">
      <section className="fixed top-0 z-20 flex justify-between w-full gap-4 p-2 bg-white">
        <article className="flex items-center gap-4">
          <Link href={`/${customLink}/explore`}>
            <button
              type="button"
              className="py-2 rounded-full z-[60] px-4 text-black bg-[#ffffff70] border"
            >
              <BiArrowBack />
            </button>
          </Link>
          <h1 className="text-xl text-black">My Couponz</h1>
        </article>
        <picture className="mr-6">
          <Image src={logoUrl} alt="logoUrl" width={44} height={44} />
        </picture>
      </section>
      <br />
      <br />
      {seeCouponz?.map((couponz) => {
        const { hours: startHours, minutes: startMinutes } = splitDecimalTime(
          couponz?.availability?.startTime,
        );
        const { hours: endHours, minutes: endMinutes } = splitDecimalTime(
          couponz?.availability?.endTime,
        );

        return (
          <section key={couponz?._id} className="flex m-4 rounded-2xl inter">
            <picture className="max-w-[8.5rem] w-full shrink-0 shadow-2xl rounded-2xl">
              <Image
                src={couponz?.image || birthdayPlaceholder}
                alt="bp"
                className="w-full max-w-[8.5rem] h-[100%] shadow-2xl rounded-l-2xl"
              />
            </picture>
            <article className="p-2 text-black bg-white shadow-2xl custom-size rounded-r-2xl">
              <h1 className="px-1 text-lg leading-none">
                {couponz?.config?.type}
              </h1>
              <div className="relative z-10 grid grid-cols-2 gap-2 px-1 mt-2">
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.5rem] text-gray-500">
                    Min. Bill Amount
                  </h3>
                  <p className="text-xs">₹{couponz?.billValue}</p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.5rem]  text-gray-500">Valid Till</h3>
                  <p className="text-xs">
                    {formatDate(couponz?.couponEndDate)}
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.5rem]  text-gray-500">
                    Applicable on
                  </h3>
                  <p className="text-xs capitalize">
                    {couponz?.availability?.customDays
                      .map((day) => day.slice(0, 3))
                      .join(", ")}
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.5rem]  text-gray-500">Avail on</h3>
                  <p className="text-xs">
                    {formatTime(startHours, startMinutes)} -
                    {formatTime(endHours, endMinutes)}
                  </p>
                </div>
              </div>
            </article>
          </section>
        );
      })}
    </main>
  );
};

const SeeMyCouponz = memo(MemoSeeMyCouponz);
export default SeeMyCouponz;
