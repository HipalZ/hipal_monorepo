"use client";
import CardOne from "@/assets/cards/card51.png";
import CardTwo from "@/assets/cards/card52.png";
import CardThree from "@/assets/cards/card53.png";
import { memo } from "react";
import hipalLogo from "@/assets/HIPAL_LOGO.svg";

import { _useAllBusiness } from "@/components/store/useAllBusiness";
import Image from "next/image";
import { useLogin } from "@/components/store/useLogin";
import useLoyaltyData from "@/components/store/useLoyaltyData";

const MemoCardFiveLayout = () => {
  const cardLayout = useLoyaltyData((s) => s.loyaltySetting.cardLayout);
  const business = _useAllBusiness((state) => state.data?.business);
  const userDetails = useLogin((s) => s.userDetails);
  const userCoinZ = useLogin((state) => state.userCoinZ);

  return (
    <section className="relative z-50 flex mx-auto min-w-auto w-[23.5rem] max-w-[28rem] h-[15.5rem] justify-between gap-4 p-4 overflow-hidden lg:rounded-2xl">
      <Image
        src={
          cardLayout === "LAYOUT_ONE"
            ? CardOne
            : cardLayout === "LAYOUT_TWO"
              ? CardTwo
              : CardThree
        }
        width={480}
        height={250}
        alt="Selected Card"
        className=" w-[100%] max-w-[28rem] rounded-2xl"
      />
      {business?.logoUrl && (
        <Image
          width={64}
          height={64}
          src={business?.logoUrl || hipalLogo}
          alt="logo"
          className="absolute top-6 right-[2rem] rounded-xl"
        />
      )}
      <figcaption className="absolute w-[80%] flex justify-between text-left text-white top-[11rem] leading-6 left-8">
        <h3 className="w-[70%] truncate font-semibold">
          {userDetails?.name || "user name"}
        </h3>
        <div>
          <span className="text-xs opacity-50">coinZ - </span>{" "}
          <span className="text-base font-semibold">{userCoinZ || 0}</span>
        </div>
      </figcaption>
    </section>
  );
};

const CardFiveLayout = memo(MemoCardFiveLayout);

export default CardFiveLayout;
