"use client";
import React, { memo, useCallback, useEffect } from "react";
import Image from "next/image";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import type { Coupon } from "@/components/types/businessData";
import {
  formatDate,
  formatDiscount,
  ICouponPage,
} from "@/components/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { useCouponz } from "@/components/store/useCouponz";
import { useLogin } from "@/components/store/useLogin";

interface Iprops {
  couponz: Coupon[];
}

const MemoAllCouponz = ({ couponz }: Iprops) => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;
  const { isLogin } = useLogin((s) => ({
    isLogin: s.isLogin,
  }));
  const { setSelectedCoupon, currentPage, setCouponz, setCurrentPage } =
    useCouponz((s) => ({
      setSelectedCoupon: s.setSelectedCoupon,
      currentPage: s.currentPage,
      setCouponz: s.setCouponz,
      setCurrentPage: s.setCurrentPage,
    }));

  const handleRoute = useCallback(
    (coupon: Coupon) => {
      setSelectedCoupon(coupon);
      router.push(`/${customLink}/couponz/`);
    },
    [currentPage],
  );

  useEffect(() => {
    setCurrentPage(ICouponPage.SINGLECOUPON);
    setCouponz(couponz);
  }, [couponz, currentPage]);

  // if no login don't show couponz
  if (!isLogin) return null;

  return (
    <section className="flex my-4 overflow-x-auto flex-nowrap">
      {couponz.map((coupon) => {
        return (
          <article
            onClick={() => handleRoute(coupon)}
            onKeyDown={() => handleRoute(coupon)}
            key={coupon?._id}
            className={
              "on_active_bounce relative flex flex-col justify-center items-center ml-4 text-primary border border-1 border-primary h-[10.5rem] w-[16rem] px-6 py-3 shrink-0"
            }
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={`left-${i.toString()}`}
                className="border border-primary absolute w-[1.5rem] h-[1.5rem] rounded-full bg-base-100 circle-left"
                style={{
                  left: "-10px",
                  top: `${(i + 0.2) * 20}%`,
                }}
              />
            ))}
            {[...Array(5)].map((_, i) => (
              <div
                key={`right-${i.toString()}`}
                className="border border-primary absolute w-[1.5rem] h-[1.5rem] rounded-full bg-base-100 circle-right"
                style={{
                  right: "-10px",
                  top: `${(i + 0.2) * 20}%`,
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
              <h4 className="text-base font-bold leading-4 text-primary">
                {coupon?.name}
              </h4>
            </article>
            <hr
              className="w-full col-span-2 my-3"
              style={{
                backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='10' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                  "#000",
                )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                height: "2px",
              }}
            />
            <section className="grid w-full grid-cols-2 text-xs">
              <article className="justify-self-start">
                <h1>Expires on</h1>
                <p>{formatDate(coupon?.conditions?.couponEndDate)}</p>
                <p className="text-[0.6rem] mt-4">Terms & conditions</p>
              </article>
              <article className="text-right justify-self-end">
                <h1 className="text-base font-semibold">
                  {formatDiscount(
                    coupon?.config?.value,
                    coupon?.config?.discountType,
                  )}
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
