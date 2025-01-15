import { memo, useCallback, useMemo } from "react";
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
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import MemoCart from "@/components/organisms/cart";
import { useCart } from "@/components/store/useCart";
import { usePathname, useRouter } from "next/navigation";
import { useUserToken } from "@hi/common/src/useUserToken";

const CashbackMessage = dynamic(() => import("./cashbackMessage"), {
  loading: () => <SkeletonLoader height={200} />,
  ssr: false,
});

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

const MemoCoinzRewardSection = () => {
  const completeUrl = window.location.href;
  const { applyCouponz, setApplyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
    setApplyCouponz: s.setApplyCouponz,
  }));
  const { setShowCart, showCart } =
    useCart();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);
  const { availedCoupon, userCouponz } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    userCouponz: s.userCouponz,
  }));
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const { userCoinZ, setUrlFrom, userDetails } = useLogin();
  const accessToken = useUserToken.getState().accessToken
  const { loyaltySetting } = useLoyaltyData((s) => ({
    loyaltySetting: s.loyaltySetting,
  }));
  const {
    billValue,
    claimedCoinz,
    claimCouponz,
    isModalOpen,
    setIsModalOpen,
    editBillModal,
    setEditBillModal,
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoinz: s.claimedCoinz,
    claimCouponz: s.claimCouponz,
    isModalOpen: s.isModalOpen,
    setIsModalOpen: s.setIsModalOpen,
    editBillModal: s.editBillModal,
    setEditBillModal: s.setEditBillModal,
  }));

  const openModal = useCallback(() => {
    if (!accessToken) {
      setCheckLogin(true)
      setUrlFrom(completeUrl)
      return
    }
    setIsModalOpen(true);
  }, [completeUrl, setCheckLogin, setUrlFrom, accessToken, setIsModalOpen]);

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
    const validCoupons = userCouponz?.filter((coupon) => {
      const couponBillValue = coupon?.conditions?.billValue ?? 0;
      return couponBillValue === 0 || couponBillValue <= billValue;
    });

    const count = validCoupons?.length ?? 0;
    return count;
  }, [billValue, userCouponz]);
  return (
    <section className="text-primary poppins-regular">
      {!outletInfo?.isPosEnabled && (
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
      )}
      <CashbackMessage />
      {loyaltySetting?._id ? (
        <>
          <section className="relative flex justify-center h-[250px] mt-4">
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
              className={
                "z-10 scaled-card-container rounded-2xl h-[235px] coupon-card-responsive ml-4 bg-white relative"
              }
              style={{
                backgroundImage: `url(${CoinzPattern.src})`,
                opacity: claimCouponz > 0 ? 0.5 : 1,
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
              {accessToken && userDetails?._id && <article className="bg-[#FFFFFFD9] text-[#101010] absolute w-full h-[5rem] bottom-0 flex flex-col justify-center items-center rounded-b-xl">
                <h1 className="mb-1 text-base">Coinz : {userCoinZ}</h1>
                {claimedCoinz > 0 && (
                  <h1 className="text-sm">Coinz Applied: {claimedCoinz}</h1>
                )}
              </article>}
            </article>
            <article
              style={{
                opacity: claimedCoinz > 0 ? 0.5 : 1,
              }}
              className="z-10 scaled-card-container-2 rounded-2xl h-[235px] coupon-card-responsive mr-4 bg-white relative"
            >
              <Image
                src={CouponzPattern}
                alt="Couponz"
                className="w-full h-2/3 rounded-t-2xl"
              />
              <article
                style={{
                  scale: 0.8,
                }}
                className="absolute z-20 top-4 left-[45%] rotate-12"
              >
                <CouponCardPay />
              </article>
              <article className="bg-[#FFC93C20] text-[#101010] absolute w-full h-[5rem] bottom-0 flex flex-col justify-center items-center rounded-b-xl">
                <center className="mx-1 mb-1 text-sm">
                  {claimCouponz > 0
                    ? `${availedCoupon?.name} Applied`
                    : userCouponz?.length === 0
                      ? "Check couponz"
                      : `You have ${validCouponCount} valid couponz`}
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
                text={cn(claimedCoinz > 0 ? "Applied" : "Use Coinz")}
                hideShine={claimedCoinz > 0 || false}
              />
            </article>
            <article
              onClick={openCouponz}
              onKeyDown={openCouponz}
              className="relative flex items-center mr-4"
            >
              <GameButton
                text={cn(claimCouponz > 0 ? "Applied" : "Use Couponz")}
                hideShine={claimCouponz > 0 || false}
              />
            </article>
          </section>
        </>
      ) : null}
      {(editBillModal && !outletInfo?.isPosEnabled) && (
        <BottomPopUp
          show={editBillModal}
          onClose={closeBillModal}
          linearGradTheme
          height="80dvh"
        >
          <AddAmountModal />
        </BottomPopUp>
      )}
      {showCart && (
        <BottomPopUp hide show={showCart} onClose={() => setShowCart(false)}>
          <MemoCart />
        </BottomPopUp>
      )}
    </section>
  );
};

const CoinzRewardSection = memo(MemoCoinzRewardSection);
export default CoinzRewardSection;
