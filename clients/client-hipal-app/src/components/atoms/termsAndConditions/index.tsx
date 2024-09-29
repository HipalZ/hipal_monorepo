import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useCouponz } from "@/components/store/useCouponz";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import React, { memo, useMemo } from "react";
import { formatDiscount } from "@/components/utils/helpers";
import dynamic from "next/dynamic";
import SkeletonLoader from "../loader/skeletonLoader";
import ShimmerImage from "../imageshimmer";

const MemoPlaceholderImg = dynamic(() => import("../placeholder"), {
  loading: () => <SkeletonLoader height={200} />,
});

const MemoTermsAndConditions = () => {
  const { selectedCoupon } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
  }));

  const { logoUrl } = useBusinessDetails((s) => ({
    logoUrl: s.businessDetails?.logoUrl,
  }));

  const sentences = useMemo(() => {
    const tc = selectedCoupon?.conditions?.tc;

    if (tc == null) {
      return [];
    }

    if (Array.isArray(tc)) {
      return tc.filter((sentence) => sentence.trim().length > 0);
    }
    if (typeof tc === "string") {
      return tc.split(".").filter((sentence) => sentence.trim().length > 0);
    }
    return [];
  }, [selectedCoupon?.conditions?.tc]);

  return (
    <section className="relative bg-white h-[80dvh] rounded-t-2xl overflow-y-auto text-black pb-[3rem]">
      <picture className="relative">
        <ShimmerImage
          src={selectedCoupon?.image}
          alt="tc"
          className="w-full border bg-[#e0dbdb]"
          width={300}
          height={300}
          style={{
            maxHeight: "16rem",
            objectFit: "contain",
          }}
        />
        <center className="z-10 -mt-8">
          {logoUrl ? (
            <div className="w-[80px] h-[80px]">
              <ShimmerImage
                src={logoUrl}
                height={86}
                width={86}
                quality={95}
                alt="logo-business"
                className="z-10 object-center bg-white rounded-full aspect-square"
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
      <article className="mr-4 text-justify poppins-regular">
        <center className="mb-4 font-semibold">Terms & conditions</center>
        {sentences && sentences?.length > 0 && (
          <ol className="text-justify custom-list">
            {sentences.map((sentence, index) => (
              <li className="text-xs" key={index?.toString()}>
                {sentence.trim()}.
              </li>
            ))}
          </ol>
        )}
      </article>
    </section>
  );
};

const TermsAndConditions = memo(MemoTermsAndConditions);
export default TermsAndConditions;
