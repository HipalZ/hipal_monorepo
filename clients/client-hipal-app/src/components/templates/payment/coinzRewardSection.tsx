import { memo, useCallback, useState } from "react";
import AddAmountModal from "@/components/molecules/bottomButton/addAmountModal";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { RiEdit2Fill } from "react-icons/ri";
import Image from "next/image";
import CardSection from "@/components/atoms/cardSection";
import GameButton from "@/components/atoms/gameButton";
import CoinzPattern from "@/assets/img/coinzpattern.png";
import CouponzPattern from "@/assets/img/couponzPattern.png";
import CouponCardPay from "./couponCardPay";
import { useCouponz } from "@/components/store/useCouponz";
import { useLogin } from "@/components/store/useLogin";
import ApplyCouponz from "../couponz/applyCouponz";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import useCouponTemp from "@/components/store/useCouponTemp";
import { cn } from "@/components/utils/helpers";
import { usePaymentStore } from "@/components/store/usePaymentStore";

const MemoBottomPopUp = dynamic(
  () => import("@/components/atoms/bottomPopUp"),
  {
    ssr: false,
    loading: () => <SkeletonLoader height={50} />,
  },
);
interface IUseCoinzPopup {
  openModal: () => void;
}

const CoinzRewardsSection = (props: IUseCoinzPopup) => {
  const { applyCouponz, setApplyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
    setApplyCouponz: s.setApplyCouponz,
  }));
  const { openModal } = props;
  const { userCoinZ } = useLogin((s) => ({
    userCoinZ: s.userCoinZ,
  }));
  const { loyaltySetting } = useLoyaltyData((s) => ({
    loyaltySetting: s.loyaltySetting,
  }));
  const [editBillModal, setEditBillModal] = useState(false);
  const { couponz } = useCouponz((s) => ({
    couponz: s.couponz,
  }));

  const { claimedCoinz, claimCouponz } = usePaymentStore((s) => ({
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
  }));

  const openBillModal = useCallback(() => {
    setEditBillModal(true);
  }, [editBillModal]);

  const closeBillModal = useCallback(() => {
    setEditBillModal(false);
  }, [editBillModal]);

  const toggleCouponz = useCallback(() => {
    setApplyCouponz(!applyCouponz);
  }, [applyCouponz]);

  return (
    <>
      <section className="text-primary poppins-regular">
        <center className="flex items-center justify-center my-2 text-primary">
          <button
            type="button"
            onClick={openBillModal}
            className="on_active_bounce px-3 py-0.5 text-sm rounded-full shadow-lg bg-[#1F1F1F]"
          >
            <RiEdit2Fill className="inline-block text-white stroke-white" />
            <span className="px-2 text-[0.65rem] font-semibold text-white">
              Edit Bill Amount
            </span>
          </button>
        </center>
        <center className="text-xs text-[#A5A2A2] my-4">Explore couponz</center>
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
            <center className="z-20 mx-4 mt-4 text-sm text-white">
              You get {loyaltySetting?.setCashBackPercentage}% on your bill
            </center>
            <article className="z-20 scaled-card-container-rotate">
              <CardSection />
            </article>
            <article className="bg-[#FFFFFFD9] text-[#101010] absolute w-full h-[90px] bottom-0 flex flex-col justify-end items-center rounded-b-xl">
              <h1 className="mb-1 text-base">Coinz : {userCoinZ}</h1>
              <p className="pb-4 mt-1 text-xs font-semibold">Use Coins</p>
            </article>
          </article>
          <span className="absolute text-sm text-white transform -translate-x-1/2 left-1/2 top-20">
            or
          </span>
          <article className="z-10 scaled-card-container-2 rounded-2xl h-[235px] w-[10rem] mr-4 bg-white relative">
            <Image
              src={CouponzPattern}
              alt="Couponz"
              className="rounded-t-2xl"
            />
            <article className="z-20 scaled-card-container-rotate-2">
              <CouponCardPay />
            </article>
            <article className="bg-[#FFC93C20] text-[#101010] absolute w-full h-[6.25rem] bottom-0 flex flex-col justify-end items-center rounded-b-xl">
              <center className="mx-1 mb-1 text-sm">
                You have {couponz ? couponz?.length : "no"} valid couponz
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
            <GameButton
              text={cn(claimedCoinz > 0 ? "Added Coinz" : "Use Coinz")}
              hideShine={claimedCoinz > 0 || false}
            />
          </article>
          <article
            onClick={toggleCouponz}
            onKeyDown={toggleCouponz}
            className="relative flex items-center mr-4"
          >
            <GameButton
              text={cn(claimCouponz > 0 ? "Added Coupon" : "Use Couponz")}
              hideShine={claimCouponz > 0 || false}
            />
          </article>
        </section>
      </section>
      {editBillModal && (
        <BottomPopUp show={editBillModal} onClose={closeBillModal}>
          <AddAmountModal />
        </BottomPopUp>
      )}
      {applyCouponz && (
        <MemoBottomPopUp show={applyCouponz} onClose={toggleCouponz} hide>
          <ApplyCouponz />
        </MemoBottomPopUp>
      )}
    </>
  );
};

const MemoCoinzRewardsPayment = memo(CoinzRewardsSection);
export default MemoCoinzRewardsPayment;
