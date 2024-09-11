import { memo, useCallback, useMemo, useState } from "react";
import { RiEdit2Fill } from "react-icons/ri";
import Image from "next/image";
import CoinzPattern from "@/assets/img/coinzpattern.png";
import CouponzPattern from "@/assets/img/couponzPattern.png";
import { useCouponz } from "@/components/store/useCouponz";
import { useLogin } from "@/components/store/useLogin";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import useCouponTemp from "@/components/store/useCouponTemp";
import { cn } from "@/components/utils/helpers";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";

const CouponCardPay = dynamic(() => import("./couponCardPay"), {
  loading: () => <SkeletonLoader height={200} />,
  ssr: false,
});
const GameButton = dynamic(() => import("@/components/atoms/gameButton"), {
  loading: () => <SkeletonLoader height={200} />,
  ssr: false,
});

const CardSection = dynamic(() => import("@/components/atoms/cardSection"), {
  loading: () => <SkeletonLoader height={200} />,
  ssr: false,
});

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  loading: () => <SkeletonLoader height={200} />,
  ssr: false,
});

const AddAmountModal = dynamic(
  () => import("@/components/molecules/bottomButton/addAmountModal"),
  { loading: () => <SkeletonLoader height={200} />, ssr: false },
);

interface IUseCoinzPopup {
  openModal: () => void;
}

const MemoCoinzRewardSection = (props: IUseCoinzPopup) => {
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

  const { billValue, claimedCoinz, claimCouponz } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
  }));

  const openBillModal = useCallback(() => {
    setEditBillModal(true);
  }, [editBillModal]);

  const closeBillModal = useCallback(() => {
    setEditBillModal(false);
  }, [editBillModal]);

  const openCouponz = useCallback(() => {
    setTimeout(() => {
      setApplyCouponz(true);
    }, 200);
  }, [applyCouponz]);

  const validCouponCount = useMemo(() => {
    return couponz.filter(
      (coupon) => coupon && coupon?.conditions?.billValue <= billValue,
    ).length;
  }, [billValue, couponz]);

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
            className="-z-12"
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
            <article className="bg-[#FFFFFFD9] text-[#101010] absolute w-full h-[5rem] bottom-0 flex flex-col justify-center items-center rounded-b-xl">
              <h1 className="mb-1 text-base">Coinz : {userCoinZ}</h1>
            </article>
          </article>
          <span className="absolute text-sm text-white transform -translate-x-1/2 left-1/2 top-20">
            or
          </span>
          <article className="z-10 scaled-card-container-2 rounded-2xl h-[235px] w-[10rem] mr-4 bg-white relative">
            <Image
              src={CouponzPattern}
              alt="Couponz"
              className="h-2/3 rounded-t-2xl"
            />
            <article className="z-20 scaled-card-container-rotate-2">
              <CouponCardPay />
            </article>
            <article className="bg-[#FFC93C20] text-[#101010] absolute w-full h-[5rem] bottom-0 flex flex-col justify-center items-center rounded-b-xl">
              <center className="mx-1 mb-1 text-sm">
                You have {couponz ? validCouponCount : "no"} valid couponz
              </center>
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
            onClick={openCouponz}
            onKeyDown={openCouponz}
            className="relative flex items-center mr-4"
          >
            <GameButton
              text={cn(claimCouponz > 0 ? "Added Coupon" : "Use Couponz")}
              hideShine={claimCouponz > 0 || false}
            />
          </article>
        </section>
        {editBillModal && (
          <BottomPopUp show={editBillModal} onClose={closeBillModal}>
            <AddAmountModal />
          </BottomPopUp>
        )}
      </section>
    </>
  );
};

const CoinzRewardSection = memo(MemoCoinzRewardSection);
export default CoinzRewardSection;
