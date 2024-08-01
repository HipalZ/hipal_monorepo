"use client";
import ReadMore from "@/components/atoms/readMore";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useCallback, useEffect } from "react";
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
import { cn } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useCartStore } from "@/components/store/useCartStore";

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
  const { setCartEmpty } = useCartStore();
  const { location, phone } = data?.outletInfo;
  const { name, logoUrl, tags, address, description } =
    data.business as BusinessDetails;
  const business = data.business as BusinessDetails;
  const setBusinessData = _useAllBusiness((s) => s.setData);

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
      setAccessToken("");
      setCartEmpty();
    }
  }, [businessDetails?.businessId, data?.business?.businessId]);

  return (
    <div className="relative flex flex-col items-center px-8">
      <section className="absolute -top-[4rem] bg-primary w-[85%] h-[10rem] rounded-squircle px-4 pt-4 text-base-100">
        <article className="flex pb-4 space-x-4">
          <figure>
            {logoUrl ? (
              <center className="w-[65px] h-[65px]">
                <Image
                  src={logoUrl}
                  height={86}
                  width={86}
                  quality={95}
                  objectFit="cover"
                  alt="logo-business"
                  className="object-center rounded-full aspect-square"
                  placeholder="blur"
                  blurDataURL={getRandomBlurImg(65, 65)}
                />
              </center>
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
                <h6 className="w-48 mt-2 text-xs font-semibold capitalize text-[var(--sf)] truncate line-clamp-1">
                  {address}
                </h6>
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
        <hr className="-mx-6 opacity-30" />

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
                className="h-[2rem] text-xs bg-secondary-content text-primary rounded-full flex justify-center items-center px-2 space-x-2"
              >
                <button.icon size={16} className="text-base-100" />
                <span className="pr-1 text-base-100">{button?.label}</span>
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
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
