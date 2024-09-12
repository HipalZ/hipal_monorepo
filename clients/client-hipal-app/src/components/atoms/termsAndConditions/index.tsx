import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useCouponz } from "@/components/store/useCouponz";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import React, { memo } from "react";
import MemoPlaceholderImg from "../placeholder";
import { formatDiscount } from "@/components/utils/helpers";

const MemoTermsAndConditions = () => {
  const { selectedCoupon } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
  }));

  const { logoUrl } = useBusinessDetails((s) => ({
    logoUrl: s.businessDetails?.logoUrl,
  }));

  return (
    <section className="relative bg-white h-[80dvh] rounded-t-2xl overflow-y-auto text-black pb-[3rem]">
      <picture className="relative">
        <Image
          src={selectedCoupon?.image}
          alt="tc"
          className="w-full border"
          width={300}
          height={500}
        />
        <center className="z-10 -mt-8">
          {logoUrl ? (
            <div className="w-[80px] h-[80px]">
              <Image
                src={logoUrl}
                height={86}
                width={86}
                quality={95}
                alt="logo-business"
                className="z-10 object-center bg-white rounded-full aspect-square"
                placeholder="blur"
                blurDataURL={getRandomBlurImg(65, 65)}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            <MemoPlaceholderImg />
          )}
        </center>
      </picture>
      <center className="mt-4 text-4xl font-bold inter">
        {formatDiscount(
          selectedCoupon?.config?.value,
          selectedCoupon?.config?.discountType,
        )}
        off{" "}
      </center>
      <center className="mx-12 my-4 text-xl bungee-inline">
        {selectedCoupon?.name || "Birthday Coupon"}
      </center>
      <article className="mx-6 text-justify poppins-regular">
        <center className="mb-4 font-semibold">Terms & conditions</center>
        {selectedCoupon?.conditions?.tc}
      </article>
    </section>
  );
};

const TermsAndConditions = memo(MemoTermsAndConditions);
export default TermsAndConditions;
