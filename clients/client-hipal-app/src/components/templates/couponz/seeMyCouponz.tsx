"use client";
import React, { memo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import {
  formatDate,
  formatDiscount,
  formatTime,
  getAvailabilityText,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";

const MemoSeeMyCouponz = () => {
  const customLink = useParams()?.businessId as string;
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );
  const couponz = useCouponz((s) => s.couponz);

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
      {couponz?.map((coupon) => {
        const startTime = formatTime(
          coupon?.conditions?.availability?.startTime || 1,
        );
        const endTime = formatTime(
          coupon?.conditions?.availability?.endTime || 23.5,
        );
        return (
          <section
            key={coupon?._id}
            className="flex max-h-full m-4 rounded-2xl inter"
          >
            <picture className="max-w-[8.5rem] w-full shrink-0 shadow-2xl rounded-2xl">
              <Image
                src={coupon?.image || birthdayPlaceholder}
                alt="bp"
                className="w-full h-[100%] shadow-2xl rounded-l-2xl"
              />
            </picture>
            <article className="px-3 py-2 text-black bg-white shadow-2xl custom-size rounded-r-2xl">
              <h1 className="px-1 text-lg leading-none">{coupon?.name}</h1>
              <div className="relative z-10 grid grid-cols-2 gap-4 px-1 mt-4">
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.6rem] text-gray-500">
                    Min. Bill Amount
                  </h3>
                  <p className="text-xs">₹{coupon?.conditions?.billValue}</p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.6rem]  text-gray-500">Valid Till</h3>
                  <p className="text-xs">
                    {formatDate(coupon?.conditions?.couponEndDate)}
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.6rem]  text-gray-500">
                    Applicable on
                  </h3>
                  <p className="text-xs capitalize">
                    {getAvailabilityText(
                      coupon?.conditions?.availability?.when,
                      coupon?.conditions?.availability?.customDays || [],
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-start space-y-1">
                  <h3 className="text-[0.6rem]  text-gray-500">Avail on</h3>
                  <p className="text-xs">
                    {startTime}-{endTime}
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
