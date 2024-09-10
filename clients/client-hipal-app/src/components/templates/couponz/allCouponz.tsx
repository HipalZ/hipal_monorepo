"use client";
import React, { memo } from "react";
import Image from "next/image";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import type { Coupon } from "@/components/types/businessData";
import { formatDate } from "@/components/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { useCouponz } from "@/components/store/useCouponz";

interface Iprops {
  couponz: Coupon[];
}

const MemoAllCouponz = ({ couponz }: Iprops) => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;

  const { setSelectedCoupon } = useCouponz((s) => ({
    setSelectedCoupon: s.setSelectedCoupon,
  }));

  const handleRoute = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    router.push(`/${customLink}/couponz/${coupon?._id}`);
  };

  return (
    <section className="flex overflow-x-auto flex-nowrap">
      {couponz.map((coupon) => {
        return (
          <article
            onClick={() => handleRoute(coupon)}
            onKeyDown={() => handleRoute(coupon)}
            key={coupon?._id}
            className="on_active_bounce relative flex flex-col justify-center items-center m-4 text-primary border border-1 border-primary h-[10.5rem] w-[16rem] px-6 py-3 shrink-0"
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={`left-${i.toString()}`}
                className="absolute w-[1.5rem] h-[1.5rem] rounded-full bg-base-100 circle-left"
                style={{
                  left: "-10px",
                  top: `${(i + 0.2) * 20}%`,
                  border: "1px solid #000",
                }}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <div
                key={`right-${i.toString()}`}
                className="absolute w-[1.5rem] h-[1.5rem] rounded-full bg-base-100 circle-right"
                style={{
                  right: "-10px",
                  top: `${(i + 0.2) * 20}%`,
                  border: "1px solid #000",
                }}
              />
            ))}
            <article className="flex w-full">
              <Image
                src={birthdayPlaceholder}
                alt="birthdayPlaceholder"
                width={31}
                height={31}
                className="object-cover w-10 h-10 mr-4 bg-center rounded-full"
              />
              <h4 className="text-sm font-bold leading-4 text-primary">
                {coupon?.name}
              </h4>
            </article>
            <div className="w-full my-3 border border-dashed border-primary" />
            <section className="grid w-full grid-cols-2 text-xs">
              <article className="justify-self-start">
                <h1>Expires on</h1>
                <p>{formatDate(coupon?.conditions?.couponEndDate)}</p>
                <p className="text-[0.6rem] mt-4">Terms & conditions</p>
              </article>
              <article className="text-right justify-self-end">
                <h1 className="text-base font-semibold">
                  {coupon?.config?.value}
                  {coupon?.config?.discountType === "PERCENTAGE" ? "%" : "₹"}{" "}
                  off
                </h1>
                <button
                  type="button"
                  className="px-2 py-1 mt-5 text-xs rounded-full on_active_bounce text-base-200 bg-primary"
                >
                  Redeem Now
                </button>
              </article>
            </section>
          </article>
        );
      })}
    </section>
  );
};

const AllCouponz = memo(MemoAllCouponz);
export default AllCouponz;
