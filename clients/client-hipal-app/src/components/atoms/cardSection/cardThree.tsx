import CardOne from "@/assets/cards/card31.png";
import CardTwo from "@/assets/cards/card32.png";
import CardThree from "@/assets/cards/card33.png";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { memo } from "react";
import Image from "next/image";
import hipalLogo from "@/assets/HIPAL_LOGO.svg";
import { useLogin } from "@/components/store/useLogin";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import ShimmerImage from "../imageshimmer";

const MemoCardThreeLayout = () => {
  const cardLayout = useLoyaltyData((s) => s.loyaltySetting.cardLayout);
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
        <ShimmerImage
          width={64}
          height={64}
          src={business?.logoUrl || hipalLogo}
          alt="logo"
          className="absolute top-6 left-6 filter invert-0 mix-blend-screen rounded-xl"
          style={{ filter: "invert(100%) contrast(150%) brightness(110%)" }}
        />
      )}
      <figcaption className="absolute w-[85%] flex justify-between text-left text-white top-[9rem] leading-6 left-8">
        <h3 className="w-[60%] h-[3rem] font-semibold">
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

const CardThreeLayout = memo(MemoCardThreeLayout);

export default CardThreeLayout;
