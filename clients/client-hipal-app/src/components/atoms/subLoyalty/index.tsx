"use client";;
import useLoyaltyData, {
  type ILoyaltySetting,
} from "@/components/store/useLoyaltyData";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "framer-motion";
import SignUpBonusBackground from "@/assets/bonuscard/signupBonus.svg";
import Wallet from "@/assets/bonuscard/wallet.png";
import Coin from "@/assets/bonuscard/coin.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import dynamic from "next/dynamic";
import { createSrcColor, type PatternKeys } from "@/components/utils/helpers";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useUserToken } from "@hi/common/src/useUserToken";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

interface ILoyaltyCard {
  loyalty: ILoyaltySetting;
}

const GoogleReviewCard = dynamic(() => import("../googleReviewCard"), {
  loading: () => <SkeletonLoader height={200} />,
});
const BirthdayCardClaim = dynamic(() => import("./birthdayCardClaim"), {
  loading: () => <SkeletonLoader height={200} />,
});
const LoyaltyCardClaim = dynamic(() => import("./loyaltyCardClaim"), {
  loading: () => <SkeletonLoader height={200} />,
});
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
  const accessToken = useUserToken.getState().accessToken;
  const placeUrl = useBusinessDetails((s) => s.businessDetails?.placeUrl);
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo)
  const { setCheckLogin } = usePaymentStore();
  const openModal = useCallback(() => {
    setTimeout(() => setIsModalOpen(true), 5000);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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

  const handleLogin = () => {
    setCheckLogin(true);
  }

  useEffect(() => {
    if (loyalty?.loyaltyId) {
      openModal();
      setLoyaltySetting(loyalty);
      findPattern(loyalty?.cardPattern);
    } else {
      setLoyaltySetting({});
    }
  }, [loyalty]);

  if (!loyalty?._id) {
    return <></>;
  }

  return (
    <div className="bg-base-100">
      <section className="py-5 h-[24rem] !mt-0 bg-base-100">
        <center>
          <h4 className="pb-4 text-2xl font-bold text-primary">REWARDZ</h4>
        </center>
        <section className="relative flex items-center justify-center gap-2 px-4 mt-4 overflow-hidden">
          {outletInfo?.birthdayCampaign ? <BirthdayCardClaim ref={ref} isInView={isInView} /> : <LoyaltyCardClaim ref={ref} isInView={isInView} setCashBackPercentage={loyaltySetting?.setCashBackPercentage} logo={logo} />}
          {loyaltySetting?.signUpBonus && loyaltySetting?.signUpBonus > 0 ? (
            <center
              ref={ref}
              className="w-full relative bg-[#E63C45] overflow-hidden max-w-[170px] h-[16.5rem] rounded-2xl"
            >
              <div className="pt-2 text-xl font-semibold leading-8 text-white">
                Signup bonus
              </div>
              <div className="px-4 text-sm font-semibold text-white">
                Win {loyaltySetting.signUpBonus} Coinz & {loyaltySetting.setCashBackPercentage}% Coinzback
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
              {!accessToken ? (
                <button
                  onClick={handleLogin}
                  type="button"
                  className="absolute bottom-2 mx-4 left-0 z-10 py-1 px-4 rounded-full w-[80%] text-sm bg-[#00000050] text-white"
                >
                  Get Now
                </button>
              ) : null}
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
      {placeUrl?.length > 0 ? <GoogleReviewCard /> : null}
    </div>
  );
};

const MemoSubLoyalty = memo(SubLoyalty);
export default MemoSubLoyalty;
