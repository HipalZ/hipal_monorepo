"use client";
import BackButton from "@/components/atoms/backButton";
import {
  beans,
  bowl,
  bud,
  flower,
  love,
  triangleToDataurl,
  waveToDataUrl,
} from "@/components/atoms/card/pathPattern";
import { useLogin } from "@/components/store/useLogin";
import useUserReward from "@/components/store/useUserReward";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { memo, useEffect, useState } from "react";
import MainLoyalty from "@/components/atoms/mainLoyalty";
import DishData from "@/components/atoms/dishDescription";
import { useQuery } from "@tanstack/react-query";
import type { IBusinessData } from "@/components/types/businessData";
import PlaceholderImg from "@/components/atoms/placeholder";
import BottomButton from "@/components/molecules/bottomButton";
import type { PatternKeys } from "@/components/utils/helpers";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { GoArrowUpRight } from "react-icons/go";
import CouponzLoyalty from "@/components/atoms/couponzLoyalty";
import Link from "next/link";
import avatar from "@/assets/img/avatar.png";
import hipalzCoinz from "@/assets/img/hipalzCoinz.png";
import RollingNumber from "@/components/rollingNumbers";
import hipalBlurred from "@/assets/svg/hipal_blurred_logo.svg";
import toast from "react-hot-toast";
import { apiRpc } from "@hi/common";

function LoyaltyCardPage({ data }: { data: IBusinessData }) {
  console.log("dta", data);
  const userName = useLogin((s) => s.userDetails.name);
  const [HiCode, setHiCode] = useState();
  const [rewards, setRewards] = useState<number>();
  const { userDetails } = useLogin();
  const setUserReward = useUserReward((s) => s.setUserReward);
  const { setUserTotalHistory, userTotalHistory } = useUserReward();
  const [image, setImage] = useState<string>("");
  const [isHiCodeModalOpen, setIsHiCodeModalOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const loyaltySetting = useLoyaltyData((s) => s.loyaltySetting);
  const searchParams = useSearchParams();
  const claim = searchParams?.get("claim");
  const customLink = useParams()?.businessId as string;
  useEffect(() => {
    const patterns = (cardPattern: PatternKeys, fontColor: string) => {
      const defaultColor = "#FAE8CA";
      const effectiveColor = fontColor || defaultColor;

      const src = {
        wave: waveToDataUrl("#000000", "white").wave,
        triangle: triangleToDataurl("white").triangle,
        beans: beans(effectiveColor).beans,
        bud: bud(effectiveColor).bud,
        bowl: bowl(effectiveColor).bowl,
        love: love(effectiveColor).love,
        flower: flower(effectiveColor).flower,
      };
      return src[cardPattern];
    };
    patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor || "#FAE8CA");
    setImage(patterns(data?.loyalty?.cardPattern, data?.loyalty?.fontColor));
  }, [data?.loyalty, data?.loyalty?.cardPattern, data?.loyalty?.fontColor]);

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
    console.log("res", response);
    if (userReward.status === 404 || userReward.status === 400) {
      toast.error("User not found");
    }
    if (userReward.status === 200 || userReward.status === 201) {
      setHiCode(response?.password);
      setRewards(response?.rewards);
      setUserReward(response);
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

  useEffect(() => {
    const audio = new Audio("/sounds/Money.mp3") as HTMLAudioElement;
    audio.play();
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

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
    <>
      <div className="relative flex flex-col w-full pt-4 pb-[5rem] bg-base-100 mb-20 text-primary">
        <div className="relative overflow-hidden">
          <div
            className="mx-6"
            style={{
              zIndex: 10,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <BackButton />
                <Image
                  src={avatar}
                  alt="avatar"
                  className="rounded-full sm:w-10 sm:h-10 lg:h-12 lg:w-12"
                />
                <b>
                  Hi{" "}
                  {userDetails?.name
                    ? userDetails.name.length > 10
                      ? `${userDetails.name.substring(0, 10)}...`
                      : userDetails.name
                    : "Guest"}{" "}
                  !!
                </b>
              </span>
              <Link
                href={`/${customLink}/loyalty/${loyaltySetting?.loyaltyId}`}
              >
                <button
                  type="button"
                  className="px-4 py-2 text-xs border rounded-full on_active_bounce bg-base-100 text-primary border-primary"
                >
                  Get History
                </button>
              </Link>
            </div>
            <br />
            {Number(claim) > 0 ? (
              <div className="h-[12rem] mx-4 flex justify-between items-center">
                <div className="relative overflow-hidden shine">
                  <Image src={hipalzCoinz} alt="reviewHand" />
                </div>
                <div className="mr-2 text-xs">
                  <RollingNumber number={Number(claim) || 0} />
                  <span className="text-xl">Coinz Earned</span>
                </div>
              </div>
            ) : null}
            <div className="relative bg-primary h-[17rem] -mx-6 rounded-t-3xl pt-4 overflow-hidden">
              <article className="absolute -rotate-45 -left-6 -top-4">
                <Image src={hipalBlurred} alt="hipalBlurred" />
              </article>
              <center>
                <Image
                  src={data?.business?.logoUrl || ""}
                  alt="logo"
                  width={95}
                  height={95}
                  className="rounded-full"
                />
                <h3 className="mt-4 text-3xl font-semibold capitalize text-base-100">
                  {data?.business?.name}
                </h3>
              </center>
              <article className="absolute rotate-45 -right-6 top-1/4">
                <Image src={hipalBlurred} alt="hipalBlurred" />
              </article>
              <br />
              <section className="flex justify-around text-center text-base-100">
                <article className="pr-5 border-r-2 border-base-100">
                  <h1 className="text-lg">{userTotalHistory?.totalWin || 0}</h1>
                  <p>Total win</p>
                </article>
                <article className="pr-5 border-r-2 border-base-100">
                  <h1 className="text-lg">
                    {userTotalHistory?.totalSave || 0}
                  </h1>
                  <p>Total saved</p>
                </article>
                <article>
                  <h1 className="text-lg">Silver</h1>
                  <p>VIP Level</p>
                </article>
              </section>
            </div>
          </div>
          <div className="bg-base-200 h-[20rem]">
            &nbsp;
            <center className="text-3xl">My Wallet</center>
            <div className="px-4 overflow-hidden" />
            <div className="w-full px-6 bg-base-100">
              <div
                onClick={() => setIsHiCodeModalOpen(true)}
                onKeyDown={() => setIsHiCodeModalOpen(true)}
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundColor: data?.loyalty?.cardColor || "primary",
                  backgroundSize: `${
                    data?.loyalty?.cardPattern === "beans" ||
                    data?.loyalty?.cardPattern === "bowl" ||
                    data?.loyalty?.cardPattern === "love" ||
                    data?.loyalty?.cardPattern === "flower" ||
                    data?.loyalty?.cardPattern === "bud"
                      ? "90px 75px"
                      : "cover"
                  }`,
                  backgroundPosition: `${
                    data?.loyalty?.cardPattern === "beans" ||
                    data?.loyalty?.cardPattern === "bowl" ||
                    data?.loyalty?.cardPattern === "love" ||
                    data?.loyalty?.cardPattern === "flower" ||
                    data?.loyalty?.cardPattern === "bud"
                      ? "right 5% top 50%"
                      : ""
                  }`,
                  backgroundRepeat: "no-repeat",
                }}
                className={`'justify-between' ${
                  animate ? "backInUp" : "tada"
                } ${
                  data?.loyalty?.cardColor
                    ? data?.loyalty?.cardColor
                    : "bg-primary"
                } text-base-content flex flex-col absolute top-0 rounded-2xl w-[60%] left-0 right-0 m-auto h-[10rem] border border-1 mb-14  ${
                  Number(claim) > 0 ? "mt-[40rem]" : "mt-[28rem]"
                } 
							transition-transform duration-500 -skew-y-6`}
              >
                <>
                  <div
                    style={{
                      maxWidth: "calc(20%)",
                      whiteSpace: "nowrap",
                    }}
                    className="mx-[1rem] mt-[1rem] w-[50px] h-[50px]"
                  >
                    {data?.business?.logoUrl ? (
                      <Image
                        src={data?.business?.logoUrl}
                        alt="logo"
                        height={100}
                        width={100}
                      />
                    ) : (
                      <PlaceholderImg />
                    )}
                  </div>
                  <h1
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      color: `${data?.loyalty?.fontColor}`,
                    }}
                    className={`${
                      data?.loyalty?.fontColor ? "" : "text-primary-content"
                    } flex self-center text-3xl font-semibold`}
                  >
                    {rewards}{" "}
                    <span
                      style={{ color: `${data?.loyalty?.fontColor}` }}
                      className={`${
                        data?.loyalty?.fontColor
                          ? `text-[${data?.loyalty?.fontColor}]`
                          : "text-primary-content"
                      } text-sm flex self-center ml-2 `}
                    >
                      Coins
                    </span>
                  </h1>
                  <h1
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      color: `${data?.loyalty?.fontColor}`,
                    }}
                    className={`${
                      data?.loyalty?.fontColor
                        ? `text-[${data?.loyalty?.fontColor}]`
                        : "text-primary-content"
                    } capitalize mx-[1rem] mb-[1rem] flex self-start text-lg `}
                  >
                    {userName}
                  </h1>
                </>
              </div>
            </div>
          </div>
          <section className="pt-8 pb-4 mb-4 text-3xl text-center">
            Couponz
          </section>
          <section className="mx-6 flex flex-nowrap overflow-x-auto h-[12rem] space-x-4">
            <CouponzLoyalty
              cardColor="#4D72F5"
              textColor="#D9D9D9"
              textContent="Birthday coupon for special"
            />
            <CouponzLoyalty
              cardColor="#8452ef"
              textColor="#D9D9D9"
              textContent="Off on your breakfast"
            />
            <CouponzLoyalty
              cardColor="#ffbc97"
              textColor="#9A3700"
              textContent="Valentine days"
            />
          </section>
          <section className="p-4 mt-4">
            <Link href={`/${customLink}/loyalty/${data?.loyalty?.loyaltyId}`}>
              <article className="flex items-center justify-between p-4 bg-base-200 rounded-2xl">
                <div>
                  <h1 className="text-lg font-semibold text-primary">
                    My History and usage
                  </h1>
                  <p className="text-sm opacity-75 text-primary">
                    Check your coinz history
                  </p>
                </div>
                <span className="p-2 text-3xl rounded-full bg-primary">
                  <GoArrowUpRight color="#fff" />
                </span>
              </article>
            </Link>
            &nbsp;
            <Link href={`/${customLink}/terms`}>
              <article className="flex items-center justify-between p-4 bg-base-200 rounded-2xl">
                <div>
                  <h1 className="text-lg font-semibold text-primary">
                    Terms & Conditions
                  </h1>
                  <p className="text-sm opacity-75 text-primary">
                    Read the policies of rewardz at{" "}
                    {businessDetails?.branchName || businessDetails?.name}
                  </p>
                </div>
                <span className="p-2 text-3xl rounded-full bg-primary">
                  <GoArrowUpRight color="#fff" />
                </span>
              </article>
            </Link>
          </section>
        </div>
      </div>
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
    </>
  );
}

const MemoLoyaltyCardPage = memo(LoyaltyCardPage);
export default MemoLoyaltyCardPage;
