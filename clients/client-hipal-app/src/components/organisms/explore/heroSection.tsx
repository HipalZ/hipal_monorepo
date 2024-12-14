"use client";
import ReadMore from "@/components/atoms/readMore";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import PlaceholderImg from "@/components/atoms/placeholder";
import type {
  BusinessDetails,
  IBusinessData,
  IResponse,
} from "@/components/types/businessData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import RestaurantTimeMemo from "@/components/atoms/time/restaurant";
import { preDefinedHeroButtons } from "@/components/utils/helpers";
import MemoRewards from "@/components/templates/explore/rewards";
import { apiRpc, cn } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCartStore } from "@/components/store/useCartStore";
import { type IUserData, useLogin } from "@/components/store/useLogin";
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import SubScribeModal from "../subscribe";
import ReviewModal from "./googleReviews/reviewModal";

interface IHeroSection {
  data: IBusinessData;
}

function HeroSection({ data }: IHeroSection): JSX.Element {
  const { setBusinessDetails, businessDetails } = useBusinessDetails((s) => ({
    setBusinessDetails: s.setBusinessDetails,
    businessDetails: s.businessDetails,
  }));
  const accessToken = useUserToken.getState().accessToken;
  const setAccessToken = useUserToken.getState().setAccessToken;
  const {
    subscribeModal,
    setSubscribeModal,
    userDetails,
    setUserCoinZ,
    reviewPopup,
    setReviewPopup,
    setGoogleReviewCount,
  } = useLogin();
  const { setCartEmpty } = useCartStore();
  const { location, phone } = data.outletInfo;
  const customLink = useParams()?.businessId as string;
  const { name, logoUrl, tags, address, description } =
    data.business as BusinessDetails;
  const business = data.business as BusinessDetails;
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const router = useRouter();

  const goToLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(location, "_blank");
  }, [location]);

  const callTheOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`tel:${phone}`);
  }, [phone]);

  const onBoardBusiness = useCallback(() => {
    window.open(`https://wa.me/${phone}`, "_blank");
  }, [phone]);

  return (
    <div className="relative flex flex-col items-center px-8">
      <div className="pt-36" />
      <MemoRewards />
      <center
        className={cn(
          "flex items-center justify-center text-xl font-bold line-clamp-2 divide-base-content text-primary",
          accessToken.length > 0 ? "pt-[8rem]" : "-pt-[1rem]",
        )}
      >
        {Array.isArray(tags) ? tags.join(" | ") : tags}
      </center>
      <center className="mt-4 text-sm text-primary">
        <ReadMore text={description} />
      </center>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
