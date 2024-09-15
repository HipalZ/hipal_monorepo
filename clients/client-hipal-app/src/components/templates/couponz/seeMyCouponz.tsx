"use client";
import React, { memo, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import {
  formatDate,
  formatTime,
  getAvailabilityText,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";

const MemoSeeMyCouponz = () => {
  const router = useRouter();
  const customLink = useParams()?.businessId as string;
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );

  const { couponz } = useCouponz((s) => ({
    couponz: s.couponz,
  }));

  const redirectExplore = useCallback(() => {
    router.push(`/${customLink}/explore`);
  }, [customLink]);

  return (
    <>
      <main className="bg-[#F1F0F5] min-h-[100vh] h-full py-4 relative pb-[5rem]">
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
        {couponz && couponz?.length > 0 ? (
          couponz?.map((coupon) => {
            const startTime = useMemo(
              () =>
                formatTime(coupon?.conditions?.availability?.startTime || 1),
              [coupon?.conditions?.availability?.startTime],
            );

            const endTime = useMemo(
              () =>
                formatTime(coupon?.conditions?.availability?.endTime || 23.5),
              [coupon?.conditions?.availability?.endTime],
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
                    width={200}
                    height={200}
                    className="object-center w-full h-full shadow-2xl aspect-square rounded-l-2xl"
                  />
                </picture>
                <article className="px-3 py-2 text-black bg-white shadow-2xl custom-size rounded-r-2xl">
                  <h1 className="px-1 text-lg leading-none">{coupon?.name}</h1>
                  <div className="relative z-10 grid grid-cols-2 gap-4 px-1 mt-4">
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-[0.6rem] text-gray-500">
                        Min. Bill Amount
                      </h3>
                      <p className="text-xs">
                        ₹{coupon?.conditions?.billValue}
                      </p>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-[0.6rem]  text-gray-500">
                        Valid Till
                      </h3>
                      <p className="text-xs">
                        {formatDate(coupon?.conditions?.couponEndDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-[0.6rem]  text-gray-500">
                        Applicable on
                      </h3>
                      <p className="text-xs text-left capitalize">
                        {getAvailabilityText(
                          coupon?.conditions?.availability?.when,
                          coupon?.conditions?.availability?.customDays || [],
                        ).map((text, index, array) => (
                          <React.Fragment key={text}>
                            {text}
                            {index + 1 !== array.length && ","}
                            {(index + 1) % 3 === 0 &&
                              index + 1 !== array.length && <br />}
                          </React.Fragment>
                        ))}
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
          })
        ) : (
          <center className="text-black">No Couponz Found</center>
        )}
        <button
          type="button"
          onClick={redirectExplore}
          className="fixed md:absolute z-20 w-[92%] mx-4 text-white bg-black rounded-full btn bottom-4"
        >
          Go to explore
        </button>
      </main>
    </>
  );
};

const SeeMyCouponz = memo(MemoSeeMyCouponz);
export default SeeMyCouponz;
