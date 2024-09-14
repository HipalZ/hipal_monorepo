"use client";

import { useLogin } from "@/components/store/useLogin";
import useUserReward from "@/components/store/useUserReward";
import Image from "next/image";
import { useParams } from "next/navigation";
import { memo, useEffect, useState } from "react";
import MainLoyalty from "@/components/atoms/mainLoyalty";
import DishData from "@/components/atoms/dishDescription";
import { useQuery } from "@tanstack/react-query";
import type { IBusinessData } from "@/components/types/businessData";
import BottomButton from "@/components/molecules/bottomButton";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";
import { RiArrowLeftLine } from "react-icons/ri";
import CardSection from "@/components/atoms/cardSection";
import Avtaar from "@/assets/login/cat.png";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import dynamic from "next/dynamic";

const CouponzBlink = dynamic(() => import("../newPayment/couponzBlink"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

const RefferalCouponz = dynamic(() => import("../newPayment/refferalCouponz"), {
  ssr: false,
  loading: () => <SkeletonLoader height={200} />,
});

function LoyaltyCardPage({ data }: { data: IBusinessData }) {
  const userName = useLogin((s) => s.userDetails.name);
  const [HiCode, setHiCode] = useState();
  const { userDetails, setUserCoinZ } = useLogin((s) => ({
    userDetails: s.userDetails,
    setUserCoinZ: s.setUserCoinZ,
  }));
  const setUserReward = useUserReward((s) => s.setUserReward);
  const { setUserTotalHistory, userTotalHistory } = useUserReward();
  const [isHiCodeModalOpen, setIsHiCodeModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting);
  const customLink = useParams()?.businessId as string;
  const getUserReward = async () => {
    if (
      userDetails.phone === "NaN" ||
      Number(userDetails.phone) === 0 ||
      loyaltySetting?.loyaltyId === undefined
    )
      return;

    const userReward = await apiRpc.users[":businessId"].getUserReward.$get({
      param: {
        businessId: businessDetails?._id,
      },
      query: {
        userId: userDetails?._id,
        loyaltyId: loyaltySetting?.loyaltyId,
      },
    });
    const response = (await userReward.json()).data;
    if (userReward.status === 404 || userReward.status === 400) {
      toast.error("User not found");
    }
    if (userReward.status === 200 || userReward.status === 201) {
      setHiCode(response?.password);
      setUserReward(response);
      setUserCoinZ(response?.rewards);
    }
    return response;
  };

  const getUserTotalRewards = async () => {
    const response = await apiRpc.users[":id"].loyaltyUserHistory.$get({
      param: {
        id: userDetails?.phone,
      },
      query: {
        loyaltyId: loyaltySetting?.loyaltyId,
        userId: userDetails?._id,
      },
    });
    const res = (await response.json()).data;
    if (response.status === 200 || response.status === 201) {
      setUserTotalHistory(res);
    }
    if (response.status === 404 || response.status === 400) {
      toast.error("User not found");
      return;
    }
    return res;
  };

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // useEffect(() => {
  //   const audio = new Audio("/sounds/Money.mp3") as HTMLAudioElement;
  //   audio.play();
  //   return () => {
  //     if (audio) {
  //       audio.pause();
  //       audio.currentTime = 0;
  //     }
  //   };
  // }, []);

  useQuery({
    queryKey: [
      "userRewardHistory",
      userDetails?._id,
      loyaltySetting?.loyaltyId,
    ],
    queryFn: getUserReward,
    enabled: !!loyaltySetting?.loyaltyId && !!userDetails?._id,
  });

  useQuery({
    queryKey: ["userTotalRewards", userDetails?._id, loyaltySetting?.loyaltyId],
    queryFn: getUserTotalRewards,
    enabled: !!loyaltySetting?.loyaltyId && !!userDetails?._id,
  });

  return (
    <main
      style={{
        background: `linear-gradient(180deg, ${data.loyalty.cardColor} 4.34%, #FFFFFF 52.99%)`,
      }}
      className="min-h-dvh"
    >
      {/* top section */}
      <section className="sticky top-0 z-50 flex items-center justify-between w-full p-4 backdrop-blur-xl">
        <Link href={`/${customLink}/explore`} className="flex items-center">
          <button
            type="button"
            className="inline-block px-3 py-1 bg-white rounded-full"
          >
            <RiArrowLeftLine className="text-black" />
          </button>
          <h3 className="ml-2">{data?.business?.name}</h3>
        </Link>

        <Link href={`/${customLink}/loyalty/${loyaltySetting?.loyaltyId}`}>
          <button
            type="button"
            style={{ color: `${data.loyalty.cardColor}` }}
            className="px-3 py-0.5 font-semibold bg-white border rounded-full on_active_bounce"
          >
            History
          </button>
        </Link>
      </section>

      {/* intro of user */}

      <center>
        <Image
          src={Avtaar}
          alt="avatar"
          width={64}
          height={64}
          className="rounded-full"
        />
        <h3 className="text-xl">Hi {userName || "Guest"}</h3>
      </center>

      {/* card section */}

      <section
        className={`mt-6  ${animate ? "backInUp" : "tada"}`}
        onClick={() => setIsHiCodeModalOpen(true)}
      >
        <CardSection />
      </section>

      {/* coinz earned */}

      <section className="flex items-center justify-between text-black px-[5rem] mt-4">
        <center>
          <b className="text-xl">{userTotalHistory.totalWin || 0}</b>
          <h3>Total wins</h3>
        </center>
        <center>
          <b className="text-xl">{userTotalHistory.totalSave || 0}</b>
          <h3>Total Saved</h3>
        </center>
      </section>
      <section className="relative">
        <center className="my-2 text-xl text-black poppins-regular">
          Rewardz
        </center>
        <CouponzBlink />
        <RefferalCouponz />
      </section>
      {/* history buttons */}

      <section className="p-4 mt-4 pb-[7rem]">
        <Link href={`/${customLink}/loyalty/${data?.loyalty?.loyaltyId}`}>
          <article className="flex items-center justify-between p-4 bg-[#eeeeee] rounded-t-2xl">
            <div>
              <h1 className="text-lg font-semibold text-primary">
                My History and usage
              </h1>
              <p className="text-sm opacity-75 text-primary">
                Check your coinz history
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#183D2E] py-2 px-3 text-sm"
            >
              Check
            </button>
          </article>
        </Link>
        <Link href={`/${customLink}/terms`}>
          <article className="flex items-center justify-between p-4 bg-[#eeeeee] rounded-b-2xl">
            <div>
              <h1 className="text-lg font-semibold text-primary">
                Terms & Conditions
              </h1>
              <p className="text-sm opacity-75 text-primary">
                Read the policies of rewardz at{" "}
                {businessDetails?.branchName || businessDetails?.name}
              </p>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#183D2E] py-2 px-5 text-sm"
            >
              Visit
            </button>
          </article>
        </Link>
      </section>

      {/* business details */}

      <BottomButton />
      {isHiCodeModalOpen && (
        <DishData
          show={isHiCodeModalOpen}
          onClose={() => setIsHiCodeModalOpen(false)}
        >
          <MainLoyalty
            logo={businessDetails?.logoUrl}
            hiCode={HiCode}
            cardColor={data?.loyalty?.cardColor}
            fontColor={data?.loyalty?.fontColor}
            loyaltySetting={loyaltySetting}
          />
        </DishData>
      )}
    </main>
  );
}

const MemoLoyaltyCardPage = memo(LoyaltyCardPage);
export default MemoLoyaltyCardPage;
