import MemoPlaceholderImg from "@/components/atoms/placeholder";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { IBusinessData } from "@/components/types/businessData";
import { getRandomBlurImg } from "@/components/utils/images";
import { updateTheme } from "@/components/utils/themes";
import Image from "next/image";
import React, { memo, useEffect } from "react";
import { MdOutlineChevronLeft } from "react-icons/md";

interface Props {
  handleBack: () => void;
}

const MemoPaymentHeader = ({ handleBack }: Props) => {
  const { businessDetails } = useBusinessDetails();
  const businessData = _useAllBusiness((s) => s.data) as IBusinessData;

  useEffect(() => {
    if (businessData.settings) {
      updateTheme(businessData.settings);
    }
  }, []);

  return (
    <section className="z-20 w-full bg-base-100 text-primary">
      <header className="bg-white h-[4.25rem] flex items-center space-x-8">
        {businessDetails?.logoUrl ? (
          <figure className="h-[5rem] p-4 w-[6rem] flex space-x-4">
            <button
              onClick={handleBack}
              type="button"
              className="h-10 pl-1 mt-1 rounded-full aspect-square as bg-black/40 on_active_bounce"
            >
              <MdOutlineChevronLeft className="text-3xl text-white " />
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
