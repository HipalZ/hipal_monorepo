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
import { MdOutlineCall } from "react-icons/md";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";

interface IHeroSection {
  data: IBusinessData;
}
function HeroSection({ data }: IHeroSection): JSX.Element {
  const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
  const { name, logoUrl, tags,address, description } = data.business as BusinessDetails;
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
        {logoUrl ? (
          <center className="p-1 w-[100px] h-[100px]">
            <Image
              src={logoUrl}
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
        {name && (
          <h4 className="text-2xl font-semibold capitalize">{name}</h4>
        )}
        {
          address && (
            <h6 className="text-base font-semibold capitalize">{address}</h6>
          )
        }
      </div>
      <div className="mt-4 text-xs font-light">
        <ReadMore text={description} />
      </div>
      <ul className="mt-4 text-2xl">
        Features
        <article className="flex flex-wrap space-x-12">
        {
          Array.isArray(tags) ? tags.map((tag)=>{
            return <li className="ml-4 list-disc">
              <h3 className="text-sm capitalize">
                {tag}
              </h3>
            </li>
          })
          :tags}
          </article>
      </ul>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
