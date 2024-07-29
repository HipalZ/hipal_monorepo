"use client";
import ReadMore from "@/components/atoms/readMore";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useEffect } from "react";
import PlaceholderImg from "@/components/atoms/placeholder";
import type {
  BusinessDetails,
  IBusinessData,
  IExplore,
} from "@/components/types/businessData";
import { TiLocationOutline } from "react-icons/ti";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import RestaurantTimeMemo from "@/components/atoms/time/restaurant";
import { preDefinedHeroButtons } from "@/components/utils/helpers";
import { MdOutlineCall } from "react-icons/md";
import MemoRewards from "@/components/templates/explore/rewards";
import { cn } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";

interface IHeroSection {
  data: IBusinessData;
}

function HeroSection({ data }: IHeroSection): JSX.Element {
  const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
  const accessToken = useUserToken.getState().accessToken;
  const { name, logoUrl, tags, address, description } =
    data.business as BusinessDetails;
  const business = data.business as BusinessDetails;
  const { location, phone } = data.settings?.explore as IExplore;
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const goToLocation = () => {
    if (typeof window !== "undefined") {
      window.location.href = location;
    }
  };

  const callTheOwner = () => {
    if (typeof window !== "undefined") {
      window.open(`tel:${phone}`);
    }
  };

  useEffect(() => {
    setBusinessData(data);
    if (business) {
      setBusinessDetails(business);
    }
  }, [data]);

  return (
    <div className="relative flex flex-col items-center px-8">
      <section className="absolute -top-[4rem] bg-primary w-[85%] h-[10rem] rounded-3xl px-4 pt-4 text-base-100">
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
              <h4 className="-mt-1 text-lg font-semibold capitalize">{name}</h4>
            )}
            {address && (
              <>
                <h6 className="w-48 mt-2 text-xs font-semibold capitalize truncate line-clamp-1">
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
              <div
                key={button?._id}
                className="h-[2rem] text-xs bg-base-100 text-primary rounded-full flex justify-center items-center px-2 space-x-2"
              >
                <button.icon size={16} />
                <span className="pr-1">{button?.label}</span>
              </div>
            );
          })}
        </article>
      </section>
      {location && (
        <button
          type="button"
          onClick={callTheOwner}
          className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-4 flex justify-center items-center"
        >
          <MdOutlineCall size={24} className="text-white" />
        </button>
      )}
      {phone && (
        <button
          type="button"
          onClick={goToLocation}
          className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-[4.5rem] flex justify-center items-center"
        >
          <TiLocationOutline size={24} className="text-white" />
        </button>
      )}
      <div className="mt-36" />
      <MemoRewards />
      <center
        className={cn(
          "flex items-center justify-center text-xl font-bold line-clamp-2 divide-base-content",
          accessToken.length > 0 ? "pt-[8rem]" : "-pt-[1rem]",
        )}
      >
        {Array.isArray(tags) ? tags.join(" | ") : tags}
      </center>
      <div className="mt-4 text-xs font-light text-center">
        <ReadMore text={description} />
      </div>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
