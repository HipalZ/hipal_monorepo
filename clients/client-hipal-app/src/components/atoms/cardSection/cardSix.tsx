"use client";
import CardOne from "@/assets/cards/card61.png";
import CardTwo from "@/assets/cards/card62.png";
import CardThree from "@/assets/cards/card63.png";
import { memo } from "react";
import hipalLogo from "@/assets/HIPAL_LOGO.svg";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import Image from "next/image";
import { useLogin } from "@/components/store/useLogin";

const MemoCardSixLayout = () => {
  const { cardLayout } = _useAllBusiness((state) => state.data?.loyalty);
  const business = _useAllBusiness((state) => state.data?.business);
  const userDetails = useLogin((s) => s.userDetails);
  const userCoinZ = useLogin((state) => state.userCoinZ);
  return (
    <section className="relative flex justify-between w-[23.5rem] max-w-[28rem] h-[15.5rem] gap-4 overflow-hidden p-4 lg:rounded-2xl">
      <Image
        src={
          cardLayout === "LAYOUT_ONE"
            ? CardOne
            : cardLayout === "LAYOUT_TWO"
              ? CardTwo
              : CardThree
        }
        width={260}
        height={160}
        alt="Selected Card"
        className=" w-[100%] max-w-[28rem]  rounded-2xl"
      />
      {business?.logoUrl && (
        <Image
          width={64}
          height={64}
          src={business?.logoUrl || hipalLogo}
          alt="logo"
          className="absolute top-8 left-[41%] filter invert-0 mix-blend-screen rounded-full"
          style={{ filter: "invert(100%) contrast(150%) brightness(110%)" }}
        />
      )}
      <figcaption className="absolute w-[92%] mx-4 flex flex-col items-center justify-center text-white top-[45%] left-0">
        <h3 className="w-[100%] font-semibold pb-4">
          {" "}
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

const CardSixLayout = memo(MemoCardSixLayout);

export default CardSixLayout;
