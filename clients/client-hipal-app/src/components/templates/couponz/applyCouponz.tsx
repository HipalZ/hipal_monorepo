"use client";
import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useParams } from "next/navigation";
import useBusinessDetails from "@/components/store/useBusinessDetails";

const MemoApplyCouponz = () => {
  const customLink = useParams()?.businessId as string;
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );
  const seeCouponz = [
    {
      _id: "1",
      name: "The Tasty Coffeecup",
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
      upto: 100,
    },
  ];

  return (
    <main className="bg-[#F1F0F5] min-h-[100vh] h-full py-4 relative inter">
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
          <article>
            <h1 className="text-lg text-black">Apply Couponz</h1>
            <p className="text-[10px] text-[#676769]">Bill Amount: ₹ 534</p>
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
      {seeCouponz?.map((couponz) => {
        return (
          <section
            key={couponz?._id}
            className="flex mx-4 my-4 rounded-2xl inter"
          >
            <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
              <div className="h-4 bg-[#9268EC] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
              <article className="flex items-center justify-between">
                <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                  {couponz?.name}
                </h1>
                <button
                  type="button"
                  className="text-[#9268EC] text-sm mt-1 font-bold"
                >
                  APPLY
                </button>
              </article>
              <div className="relative z-10 gap-2 px-1 mt-2">
                <div className="flex flex-col items-start space-y-1">
                  <p className="text-xs font-semibold text-[#00C37E]">
                    Get ₹{couponz?.billValue} off on this bill
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
                    Use this coupon & get 25% off on bill above ₹ 500. Maximum
                    discount: ₹ 100
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
      {seeCouponz?.map((couponz) => {
        return (
          <section
            key={couponz?._id}
            className="flex mx-4 my-4 rounded-2xl inter"
          >
            <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
              <div className="h-4 bg-[#AAAAAA] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
              <article className="flex items-center justify-between">
                <h1 className="p-1 mt-1 text-[#AAAAAA] text-sm font-bold leading-none">
                  {couponz?.name}
                </h1>
                <button
                  type="button"
                  className="text-[#AAAAAA] text-sm mt-1 font-bold"
                >
                  APPLY
                </button>
              </article>
              <div className="relative z-10 gap-2 px-1 mt-2">
                <div className="flex flex-col items-start space-y-1">
                  <p className="text-xs font-semibold text-[#00C37E]">
                    Get ₹{couponz?.billValue} off on this bill
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
                    Use this coupon & get 25% off on bill above ₹ 500. Maximum
                    discount: ₹ {couponz?.upto}
                  </h3>
                </div>
              </div>
            </article>
          </section>
        );
      })}
    </main>
  );
};

const ApplyCouponz = memo(MemoApplyCouponz);
export default ApplyCouponz;
