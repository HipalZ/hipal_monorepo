"use client";
import { useLogin } from "@/components/store/useLogin";
import useUserReward from "@/components/store/useUserReward";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { apiRpc } from "@hi/common";
import CardSection from "@/components/atoms/cardSection";
import dynamic from "next/dynamic";
import CurvedText from "@/components/atoms/curvedText";
import Sunrays from "@/assets/img/sunrays_white.png";
import { useReview } from "@/components/store/useReview";
import { useErrorHandling } from "@/utils/helper";
import { toast } from "react-toastify";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { CardSkeleton } from "@/components/atoms/paymentPageLoader";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { useCart } from "@/components/store/useCart";
import { getUserLoyaltyCoinz } from "../../../apis/userApis";
const Avatar = dynamic(() => import("@/components/atoms/avatar"), {
  ssr: false,
  loading: () => <CardSkeleton />,
});

const MemoPayOnlineSuccess = () => {
  const userName = useLogin((s) => s.userDetails.name);
  const animate = useRef(false);
  const { errorText } = useErrorHandling();
  const { setIsPaymentDone } = useReview((s) => ({
    setIsPaymentDone: s.setIsPaymentDone,
  }));
  const { setInputModal } = useCart();
  const { userDetails, setUserCoinZ } = useLogin((s) => ({
    userDetails: s.userDetails,
    setUserCoinZ: s.setUserCoinZ,
  }));
  const { setIsLoading } = usePaymentStore();
  const setUserReward = useUserReward((s) => s.setUserReward);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting);
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const mode = searchParams.get("mode");
  const claim = searchParams.get("claim");
  const getUserReward = async () => {
    // making the payment loader off
    setIsLoading(false);
    if (
      userDetails.phone === "NaN" ||
      Number(userDetails.phone) === 0 ||
      loyaltySetting?.loyaltyId === undefined
    )
      return;

    const userReward = await getUserLoyaltyCoinz({
      userId: userDetails?._id as string,
      businessId: businessDetails?._id as string,
      loyaltyId: loyaltySetting?.loyaltyId as string,
    });
    const response = (await userReward.json()).data;
    if (userReward.status === 404 || userReward.status === 400) {
      toast.error("User not found");
    }
    if (userReward.status === 200 || userReward.status === 201) {
      setUserReward(response);
      setUserCoinZ(response?.rewards || 0);
    }
    if (userReward.status === 401) {
      errorText(userReward.status);
    }
    setInputModal(false);
    return response;
  };

  const handleReviewPage = useCallback(() => {
    setIsPaymentDone(true);
  }, [setIsPaymentDone]);

  useEffect(() => {
    animate.current = true;

    const timer = setTimeout(() => {
      animate.current = false;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const textContent = useMemo(() => {
    switch (mode) {
      case "online":
        return {
          header: "Congratulations!",
          color: "#5ACB7A",
          subHeader: "Your Payment of",
          amount: `${businessDetails?.currencySymbol} ${amount}`,
          footer: "Is Successful",
          coinzContent: `You won approx. ${claim} coinz`,
        };
      default:
        return {
          header: "Thank You!",
          color: "#CB5A5C",
          subHeader: "Your Payment of",
          amount: `${businessDetails?.currencySymbol} ${amount}`,
          footer: "Will be confirmed by the staff",
          coinzContent: `You'll get approx. ${claim} coinz`,
        };
    }
  }, [mode, amount, claim, businessDetails?.currencySymbol]);

  useQuery({
    queryKey: [
      "userRewardHistory",
      userDetails?._id,
      loyaltySetting?.loyaltyId,
    ],
    queryFn: getUserReward,
    enabled: !!loyaltySetting?.loyaltyId && !!userDetails?._id,
  });

  return (
    <main
      className="pt-4 min-h-dvh"
      style={{
        background: animate
          ? "#000"
          : `radial-gradient(50% 50% at 50% 50%, ${textContent?.color} 0%, rgba(26, 26, 26, 0.75) 100%)`,
      }}
    >
      <center className="relative space-grotesk-700">
        <Avatar />
        {animate ? null : (
          <Image
            className="absolute opacity-25 mt-36 animate-spin"
            width={1080}
            height={1080}
            src={Sunrays}
            alt="SunlightReview"
          />
        )}
        <h3 className="text-xl">Hi {userName || "Guest"}</h3>
        <CurvedText text={textContent?.header} />
        <h1 className="poppins-regular">Your Payment of</h1>
        <h6 className="my-1 text-4xl poppins-regular">
          {businessDetails?.currencySymbol} {amount}
        </h6>
        <h6 className="poppins-regular">{textContent?.footer}</h6>
      </center>
      {/* card section */}

      <section
        style={{
          transform: "rotate(8deg) scale(0.75)",
        }}
        className={`mt-6 ${animate ? "backInUp" : "tada"}`}
      >
        <CardSection />
      </section>
      {Number(claim) > 0 ? <center>{textContent?.coinzContent}</center> : null}
      <br />
     
      <section
        style={{
          boxShadow: "0px 0px 2px 0px #0000001F",
        }}
        className="w-full max-w-[30rem] rounded-t-2xl fixed bottom-0 h-16 bg-white flex items-center justify-between px-4 !font-bold text-black"
      >
        <h1 className="text-xs text-left inter">
          Share Your Experience with us
        </h1>

        <article
          onClick={handleReviewPage}
          onKeyDown={handleReviewPage}
          className="px-3 py-2 text-xs text-white bg-black rounded-lg w-36 inter on_active_bounce"
        >
          <span>Review & Continue</span>
        </article>
      </section>
    </main>
  );
};

const PayOnlineSuccess = memo(MemoPayOnlineSuccess);
export default PayOnlineSuccess;
