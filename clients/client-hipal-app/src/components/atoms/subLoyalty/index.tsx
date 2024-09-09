"use client";
import useLoyaltyData, {
  type ILoyaltySetting,
} from "@/components/store/useLoyaltyData";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import Stairs from "@/assets/backgroundStairs.png";
import SignUpBonusBackground from "@/assets/bonuscard/signupBonus.svg";
import Wallet from "@/assets/bonuscard/wallet.png";
import googleImage from "@/assets/img/googleImg.png";
import Coin from "@/assets/bonuscard/coin.png";
import Star from "@/assets/svg/Star.svg";
import { useLogin } from "@/components/store/useLogin";
import Link from "next/link";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";
import { createSrcColor, type PatternKeys } from "@/components/utils/helpers";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { apiRpc } from "@hi/common";
import { useParams } from "next/navigation";
import { useUserToken } from "@hi/common/src/useUserToken";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/components/utils/helpers";
import { LuArrowRight } from "react-icons/lu";

interface ILoyaltyCard {
  loyalty: ILoyaltySetting;
}
const DishData = dynamic(() => import("@/components/atoms/dishDescription"), {
  loading: () => <SkeletonLoader height={200} />,
});
const MainLoyalty = dynamic(() => import("@/components/atoms/mainLoyalty"), {
  loading: () => <SkeletonLoader height={50} />,
});

const SubLoyalty = ({ loyalty }: ILoyaltyCard): JSX.Element => {
  const { loyaltySetting, setLoyaltySetting } = useLoyaltyData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const logo = useBusinessDetails((s) => s.businessDetails?.logoUrl);
  const customLink = useParams()?.businessId as string;
  const accessToken = useUserToken.getState().accessToken;
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const { userDetails } = useLogin((s) => ({ userDetails: s.userDetails }));
  const { isLogin, setReviewPopup } = useLogin((s) => ({
    isLogin: s.isLogin,
    setReviewPopup: s.setReviewPopup,
  }));

  const openModal = () => {
    setTimeout(() => setIsModalOpen(true), 5000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const srcColor = useMemo(
    () => createSrcColor(loyaltySetting),
    [loyaltySetting],
  );
  const findPattern = useCallback(
    (pattern: PatternKeys) => {
      const value = srcColor.find((item) => pattern in item.src);
      return value?.src[pattern as keyof typeof value.src];
    },
    [srcColor],
  );

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user !== undefined) {
        const res = await apiRpc.reviews.storeGoogleAuthUser.$post({
          json: {
            businessId: businessId.toString(),
            loyaltyId: loyalty.loyaltyId.toString(),
            userId: userDetails._id.toString(),
            authorName: user?.displayName || userDetails?.name,
          },
        });
        console.log("res", res);
        const response = await res.json();
        if (response?.data?.googleReviewCount === 1) {
          setReviewPopup(true);
        } else {
          setReviewPopup(false);
        }
      }

      // Redirect to the Google review page
      const url =
        businessDetails?.placeUrl || "https://g.page/r/CTI8IdplcFrJEAE/review";
      // window.open(url, "_blank");
      window.location.href = url;

      return user;
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  useEffect(() => {
    if (loyalty?.loyaltyId) {
      openModal();
      setLoyaltySetting(loyalty);
      findPattern(loyalty?.cardPattern);
    }
  }, []);

  if (!loyalty?._id) {
    return <></>;
  }

  return (
    <div className="bg-primary">
      <section className="py-10 h-[25rem] !mt-0 bg-primary">
        <center>
          <h4 className="pb-4 text-2xl font-bold text-base-100">REWARDZ</h4>
        </center>
        <section className="relative flex items-center justify-center gap-2 px-4 mt-4 overflow-hidden">
          <center
            ref={ref}
            className="w-full relative p-4 bg-[#6A35FF] overflow-hidden max-w-[190px] h-[16.5rem] rounded-2xl"
          >
            <div className="text-xl font-semibold text-white">
              {loyaltySetting.setCashBackPercentage}% Coinzback
            </div>
            <figure className="absolute top-[67%] left-[6%] transform -translate-y-[13%] overflow-hidden">
              <Image width={150} src={Stairs} alt="stars" />
            </figure>
            <center className="text-base text-white">At every bill</center>
            <center
              className={`relative pb-4 ${isInView ? "flipping-card" : ""} `}
            >
              <div
                className="mt-10 overflow-hidden rounded card_up_down"
                style={{
                  height: "77px",
                  width: "128px",
                  backgroundColor: "#FEFAEE",
                }}
              >
                <figure className="aspect-square w-[2.5rem] h-[2.5rem] overflow-hidden absolute top-1/2 left-[8%] transform -translate-y-1/2 rounded-full">
                  <Image src={logo} alt="logo" height={36} width={36} />
                </figure>

                <figcaption
                  style={{
                    color: "#183D2E",
                  }}
                  className="absolute text-sm transform -translate-x-[20%] -translate-y-[30%] rounded-full aspect-square top-1/2 left-1/2"
                >
                  Loyalty card
                </figcaption>
                <div className="h-full w-[0.625rem] absolute top-1/2 right-0 transform -translate-y-1/2 bg-[#183D2E]" />
              </div>
              <div className="bottom_shadow" />
            </center>
            <div className="h-full w-[0.625rem] text-sm absolute top-[30%] right-4 text-white animate-pulse">
              ✨
            </div>
            {accessToken && (
              <Link href={`/${customLink}/loyalty`}>
                <button
                  type="button"
                  className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                >
                  Claim Now
                </button>
              </Link>
            )}
            {!accessToken && (
              <Link href={`/${customLink}/user/signup`}>
                <button
                  type="button"
                  className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                >
                  Claim Now
                </button>
              </Link>
            )}
          </center>
          {loyaltySetting?.signUpBonus && loyaltySetting?.signUpBonus > 0 ? (
            <center
              ref={ref}
              className="w-full relative bg-[#E63C45] overflow-hidden max-w-[170px] h-[16.5rem] rounded-2xl"
            >
              <div className="pt-4 text-xl font-semibold leading-8 text-white">
                Signup bonus
              </div>
              <div className="px-4 text-sm font-semibold text-white">
                Win {loyaltySetting.signUpBonus} Coinz on your signup
              </div>
              <figure className="absolute bottom-0 z-0 animate-pulse">
                <Image src={SignUpBonusBackground} alt="signup bonus" />
              </figure>
              <figure className="absolute z-0 top-[5rem] left-10 card_up_down">
                <Image width={100} height={100} src={Coin} alt="Coin" />
              </figure>
              <figure className="absolute bottom-6 z-1">
                <Image src={Wallet} alt="Wallet" />
              </figure>
              {!accessToken && (
                <Link href={`/${customLink}/user/signup`}>
                  <button
                    type="button"
                    className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                  >
                    Get Now
                  </button>
                </Link>
              )}
            </center>
          ) : null}
          {!isModalOpen && (
            <DishData show={isModalOpen} onClose={closeModal}>
              <MainLoyalty
                logo={logo}
                cardColor={loyaltySetting?.cardColor}
                fontColor={loyaltySetting?.fontColor}
                loyaltySetting={loyalty}
              />
            </DishData>
          )}
        </section>
      </section>
      {isLogin ? (
        <div className="p-2 mb-4">
          <div className="bg-[#FFC600] lg:w-1/2 w-full min-h-full max-h-[11rem] rounded-2xl p-4 flex relative overflow-hidden">
            <div className="z-10 space-y-4">
              <div className="text-black">
                <h1 className="text-xs font-bold">Write a review &</h1>
                <p className="relative inline-flex items-center text-xl font-bold">
                  Earn Coinz{" "}
                  <Image
                    src={Star}
                    alt="Star"
                    width={8}
                    height={8}
                    className="absolute transform translate-x-1/2 -translate-y-1/2 -right-4 -top-1"
                  />
                  <Image
                    src={Star}
                    alt="Star"
                    width={12}
                    height={12}
                    className="absolute transform translate-x-1/2 -translate-y-1/2 top-1 -right-2"
                  />
                </p>
                <p className="text-sm text-[#000000B8]">
                  Leave a review on Google <br /> & Claim your reward.
                </p>
              </div>
              <div className="w-full h-10">
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center px-4 py-1.5 -ml-4 text-sm font-bold text-white scale-90 rounded-full bg-black/60"
                >
                  Write a review <LuArrowRight size={20} />
                </button>
              </div>
            </div>
            <div className="absolute top-0 -right-6 z-0 w-[10rem] h-full">
              <Image
                src={googleImage}
                alt="Google Review"
                className="object-cover w-full h-full scale-150 rounded-md"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MemoSubLoyalty = memo(SubLoyalty);
export default MemoSubLoyalty;
