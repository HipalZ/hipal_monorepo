import MemoPlaceholderImg from "@/components/atoms/placeholder";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import React, { memo } from "react";
import Sunrays from "@/assets/img/sunrays_white.png";

const MemoPaymentHeader = () => {
  const { businessDetails } = useBusinessDetails();

  return (
    <center className="pt-2">
      <p className="mb-2 text-sm font-semibold">Paying:</p>
      <section className="absolute inset-0 flex items-center justify-center">
        <center className="absolute w-[300px] -top-20">
          <Image
            className="opacity-15"
            width={1080}
            height={1080}
            src={Sunrays}
            alt="SunlightReview"
          />
        </center>
      </section>
      <picture className="relative">
        {businessDetails?.logoUrl ? <Image
          src={businessDetails?.logoUrl}
          height={50}
          width={50}
          quality={95}
          objectFit="cover"
          alt="logo-businessDetails"
          className="object-center bg-white border rounded-full shadow-sm aspect-square"
          placeholder="blur"
          blurDataURL={getRandomBlurImg(100, 100)}
        /> : <MemoPlaceholderImg />}
      </picture>
      <div
        className="relative"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 1) 50%)",
          paddingTop: "50px",
        }}
      >
        <p className="relative z-20 -mt-10 text-base font-semibold">
          {businessDetails?.name}
        </p>
      </div>
    </center>
  );
};

const PaymentHeader = memo(MemoPaymentHeader);
export default PaymentHeader;
