"use client";
import ReadMore from "@/components/atoms/readMore";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo, useEffect } from "react";
import PlaceholderImg from "@/components/atoms/placeholder";
import type {
  IBiz,
  IBusinessData,
  IExplore,
} from "@/components/types/businessData";
import { TiLocationOutline } from "react-icons/ti";
import { MdOutlineCall } from "react-icons/md";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";

interface IHeroSection {
  data: IBusinessData;
}
function HeroSection({ data }: IHeroSection): JSX.Element {
  const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
  const { businessName, logo, tags, description } = data.business as IBiz;
  const { location, phone } = data.settings?.explore as IExplore;
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const goToLocaltion = () => {
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
    if (data?.business) {
      setBusinessDetails(data.business);
    }
  }, [data]);

  return (
    <div className="relative flex flex-col px-8">
      <figure className="absolute z-10 -top-[4rem] left-4 bg-base-100 rounded-full">
        {data.business?.logo ? (
          <center className="p-1 w-[100px] h-[100px]">
            <Image
              src={logo}
              height={86}
              width={86}
              quality={95}
              objectFit="cover"
              alt="logo-business"
              className="object-center rounded-full aspect-square"
              placeholder="blur"
              blurDataURL={getRandomBlurImg(100, 100)}
            />
          </center>
        ) : (
          <PlaceholderImg />
        )}
      </figure>
      {location && (
        <section
          onClick={callTheOwner}
          className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-4 flex justify-center items-center"
        >
          <MdOutlineCall size={24} className="text-white" />
        </section>
      )}
      {phone && (
        <section
          onClick={goToLocaltion}
          className="w-10 h-10 rounded-full bg-[#00000050] absolute z-10 top-2 right-[4.5rem] flex justify-center items-center"
        >
          <TiLocationOutline size={24} className="text-white" />
        </section>
      )}

      <div className="pt-8 space-y-2">
        {businessName && (
          <h4 className="text-2xl font-semibold capitalize">{businessName}</h4>
        )}
        <h3 className="flex text-sm font-bold line-clamp-2 divide-base-content">
          {Array.isArray(tags) ? tags.join(" | ") : tags}
        </h3>
      </div>
      <div className="mt-auto text-xs font-light">
        <ReadMore text={description} />
      </div>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
