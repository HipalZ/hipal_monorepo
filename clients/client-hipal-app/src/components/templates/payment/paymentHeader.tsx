import MemoPlaceholderImg from "@/components/atoms/placeholder";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import React, { memo } from "react";
import { BiArrowBack } from "react-icons/bi";

interface Props {
  handleBack: () => void;
}

const MemoPaymentHeader = ({ handleBack }: Props) => {
  const { businessDetails } = useBusinessDetails();

  return (
    <section className="z-20 w-full bg-base-100 text-primary">
      <header className="bg-white h-[4.25rem] flex items-center gap-16">
        {businessDetails?.logoUrl ? (
          <figure className="h-[5rem] p-4 aspect-square flex space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="scale-75 py-0 h-10 rounded-full px-4 z-[60] text-black bg-[#ffffff70] border border-1 border-[#CACACA]"
            >
              <BiArrowBack />
            </button>
            <Image
              src={businessDetails?.logoUrl}
              height={80}
              width={80}
              quality={95}
              objectFit="cover"
              alt="logo-businessDetails"
              className="object-center border rounded-full shadow-sm aspect-square"
              placeholder="blur"
              blurDataURL={getRandomBlurImg(100, 100)}
            />
          </figure>
        ) : (
          <MemoPlaceholderImg />
        )}
        <div>
          Paying: <br />
          <span className="font-bold text-primary">
            {businessDetails?.branchName || businessDetails?.name}
          </span>
        </div>
      </header>
    </section>
  );
};

const PaymentHeader = memo(MemoPaymentHeader);
export default PaymentHeader;
