import { IoMdCard } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { memo, useCallback, useState } from "react";
import AddAmountModal from "@/components/molecules/bottomButton/addAmountModal";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { RiCouponFill, RiEdit2Fill } from "react-icons/ri";
import { AiFillEdit } from "react-icons/ai";
import Image from "next/image";
import CardSection from "@/components/atoms/cardSection";
import GameButton from "@/components/atoms/gameButton";
import CoinzPattern from "@/assets/img/coinzpattern.png";
import CouponzPattern from "@/assets/img/couponzPattern.png";
import CouponCardCongrats from "@/components/atoms/couponCardCongrats";
import CouponCardPay from "./couponCardPay";

interface IUseCoinzPopup {
  openModal: () => void;
  billValue: number;
}

const CoinzRewardsPayment = (props: IUseCoinzPopup) => {
  const { openModal, billValue } = props;
  const [editBillModal, setEditBillModal] = useState(false);
  const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting);
  const openBillModal = useCallback(() => {
    setEditBillModal(true);
  }, []);

  const closeBillModal = useCallback(() => {
    setEditBillModal(false);
  }, []);

  return (
    <section className="text-primary poppins-regular">
      <center className="flex items-center justify-center my-2 text-primary">
        <button
          type="button"
          onClick={openBillModal}
          className="px-3 py-0.5 text-sm rounded-full shadow-lg bg-[#1F1F1F]"
        >
          <RiEdit2Fill className="inline-block text-white stroke-white" />
          <span className="px-2 text-[0.65rem] font-semibold text-white">
            Edit Bill Value
          </span>
        </button>
      </center>
      <center className="text-xs text-[#A5A2A2] my-4">
        Used coffee cups coupon and got ₹ 200 off
      </center>
      <section className="relative flex justify-around h-[250px]">
        <div
          className="absolute inset-0 -z-12"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, #9167EA 0%, rgba(26, 26, 26, 0) 100%)",
            height: "575px",
            width: "100%",
          }}
        />
        <article
          className="z-10 scaled-card-container rounded-2xl h-[235px] w-[10rem] ml-4 bg-white relative"
          style={{
            backgroundImage: `url(${CoinzPattern.src})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <center className="z-20 mx-6 mt-4 text-sm text-white">
            You can use 100% of ₹ 200
          </center>
          <article className="z-20 scaled-card-container-rotate">
            <CardSection />
          </article>
          <article className="bg-[#FFFFFFD9] text-[#101010] absolute w-full h-[90px] bottom-0 flex flex-col justify-end items-center rounded-b-xl">
            <h1 className="mb-1 text-base">Coinz : 100</h1>
            <p className="pb-4 mt-1 text-xs font-semibold">Use Coins</p>
          </article>
        </article>
        <span className="absolute text-sm text-white transform -translate-x-1/2 left-1/2 top-20">
          or
        </span>
        <article className="z-10 scaled-card-container-2 rounded-2xl h-[235px] w-[10rem] mr-4 bg-white relative">
          <Image src={CouponzPattern} alt="Couponz" className="rounded-t-2xl" />
          <article className="z-20 scaled-card-container-rotate-2">
            <CouponCardPay />
          </article>
          <article className="bg-[#FFC93C20] text-[#101010] absolute w-full h-[6.25rem] bottom-0 flex flex-col justify-end items-center rounded-b-xl">
            <center className="mx-1 mb-1 text-sm">
              You have 2 valid couponz
            </center>
            <p className="pb-4 text-xs font-semibold">Use Couponz</p>
          </article>
        </article>
      </section>
      <section className="flex justify-between">
        <article
          className="relative flex items-center mx-4"
          onClick={openModal}
          onKeyDown={openModal}
        >
          <GameButton text="Use Coinz" />
        </article>
        <article className="relative flex items-center mr-4">
          <GameButton text="Use Couponz" />
        </article>
      </section>

      {/* <article
        onClick={openModal}
        onKeyDown={openModal}
        className="animation-shake flex justify-between items-center h-[90px] mx-4 rounded-3xl p-6 mt-4 bg-base-200 text-primary shadow-lg"
      >
        <div className="flex items-center">
          <IoMdCard size={30} className="-rotate-45 " />
          &nbsp; &nbsp;
          <div>
            <h6>Use Coinz</h6>
            <h6 className="text-xs">
              You can use {loyaltySetting.setClaimedPercentage} % of{" "}
              <span className="font-bold">₹ {billValue}</span>{" "}
            </h6>
          </div>
        </div>
        <div className="flex items-center space-x-4">Apply</div>
      </article>
      <article className="animation-shake flex justify-between items-center h-[90px] mx-4 rounded-3xl p-6 mt-4 bg-base-200 text-primary shadow-lg">
        <div className="flex items-center">
          <RiCouponFill size={30} className="-rotate-45 " />
          &nbsp; &nbsp;
          <div>
            <h6>Use Couponz</h6>
            <h6 className="text-xs">
              You can use <span className="font-bold">5 Couponz </span>{" "}
            </h6>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">Coming Soon</div>
      </article> */}
      {editBillModal && (
        <BottomPopUp show={editBillModal} onClose={closeBillModal}>
          <AddAmountModal />
        </BottomPopUp>
      )}
    </section>
  );
};

const MemoCoinzRewardsPayment = memo(CoinzRewardsPayment);
export default MemoCoinzRewardsPayment;
