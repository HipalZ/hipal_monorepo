"use client";
import ReadMore from "@/components/atoms/readMore";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useCallback, useEffect, useState } from "react";
import PlaceholderImg from "@/components/atoms/placeholder";
import type {
  BusinessDetails,
  IBusinessData,
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
import useLoyaltyData from "@/components/store/useLoyaltyData";
import MemoBottomPopUp from "@/components/atoms/bottomPopUp";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import SubScribeModal from "../subscribe";

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
  const { userDetails, setUserCoinZ } = useLogin((s) => ({
    userDetails: s.userDetails,
    setUserCoinZ: s.setUserCoinZ,
  }));
  const { setCartEmpty } = useCartStore();
  const { location, phone } = data?.outletInfo;
  const customLink = useParams()?.businessId as string;
  const { name, logoUrl, tags, address, description } =
    data.business as BusinessDetails;
  const business = data.business as BusinessDetails;
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const loyaltyInfo = useLoyaltyData((s) => s.loyaltySetting);
  const [subscribeModal, setSubscribeModal] = useState<boolean>(false);
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

  const isSubscribe = async (userDetails: IUserData) => {
    const { business } = data;

    const { loyaltyId } = loyaltyInfo;

    const payload = {
      businessId: business?.businessId?.toString() ?? "",
      userId: userDetails._id,
      ...(loyaltyId && { loyaltyId }),
    };

    const response = await apiRpc.subscribers.$get({
      query: payload,
    });
    const res = await response.json();
    if (response.status === 404) {
      setSubscribeModal(true);
    }
    if (response.status === 200) {
      setUserCoinZ(res?.rewards);
    }
  };

  const closeSubscribeModal = useCallback(() => {
    setSubscribeModal(false);
    setAccessToken("");
    return router.push(`/${customLink}/explore`);
  }, [accessToken, subscribeModal]);

  useEffect(() => {
    setBusinessData(data);
    if (business) {
      setBusinessDetails(business);
    }
  }, [data]);

  useEffect(() => {
    if (!accessToken) {
      setAccessToken("");
    }
    if (businessDetails?.businessId !== data?.business?.businessId) {
      setCartEmpty();
    }
  }, [businessDetails?.businessId, data?.business?.businessId]);

  useEffect(() => {
    if (userDetails?._id) {
      isSubscribe(userDetails);
    }
  }, [customLink, userDetails._id]);

  if (isLoader) {
    return <LoadingSpinnerCircle />;
  }

  return (
    <div className="relative flex flex-col items-center px-8">
      <section className="absolute -top-[4rem] bg-primary w-[90%] h-[11rem] rounded-squircle px-4 pt-4 text-base-100 shadow-2xl">
        <article className="flex pb-4 space-x-4">
          <figure>
            {logoUrl ? (
              <div className="w-[65px] h-[65px] flex justify-center items-center">
                <Image
                  src={logoUrl}
                  height={86}
                  width={86}
                  quality={95}
                  alt="logo-business"
                  className="object-center rounded-full aspect-square"
                  placeholder="blur"
                  blurDataURL={getRandomBlurImg(65, 65)}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <PlaceholderImg />
            )}
          </figure>
          <div>
            {name && (
              <h4 className="-mt-1 text-lg font-semibold capitalize text-[var(--sf)]">
                {name}
              </h4>
            )}
            {address && (
              <>
                <div style={{ overflow: "hidden" }}>
                  <h6 className="h-6 text-xs font-semibold capitalize text-[var(--sf)] scrolling-text">
                    {address}
                  </h6>
                </div>
                <h6 className="absolute top-[2rem] px-2 py-1 text-xs rounded-md -right-4 bg-[#3DC18B] text-white z-20">
                  OPEN
                </h6>
                <div className="absolute top-[2.5rem] px-2 py-1 text-xs rounded-md -right-1 w-5 h-10 rotate-45 bg-[#1E7250] text-primary z-[-1]" />
              </>
            )}
            <article className="flex gap-1 mt-1">
              <h6 className="text-xs">⭐ 4.5</h6>
              <RestaurantTimeMemo business={data?.business} />
            </article>
          </div>
        </article>
        <hr className="-mx-4 opacity-30" />

        <article className="flex items-center justify-between gap-2 mt-3">
          {preDefinedHeroButtons.map((button) => {
            return (
              <button
                type="button"
                key={button?._id}
                onClick={() => {
                  if (button?.label.toLowerCase() === "direction") {
                    goToLocation();
                  } else if (button?.label.toLowerCase() === "call") {
                    callTheOwner();
                  } else {
                    onBoardBusiness();
                  }
                }}
                className="h-[2rem] text-xs bg-secondary-content rounded-full flex justify-center items-center px-2 space-x-2"
              >
                <button.icon size={16} className="text-[var(--sf)] " />
                <span className="pr-1 text-[var(--sf)] ">{button?.label}</span>
              </button>
            );
          })}
        </article>
      </section>
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
      {subscribeModal && (
        <MemoBottomPopUp
          show={subscribeModal}
          onClose={closeSubscribeModal}
          hide
        >
          <SubScribeModal
            closeSubscribeModal={closeSubscribeModal}
            setIsLoader={setIsLoader}
            business={business}
            setSubscribeModal={setSubscribeModal}
          />
        </MemoBottomPopUp>
      )}
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
