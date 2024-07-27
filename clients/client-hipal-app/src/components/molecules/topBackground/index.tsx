"use client";
import PlaceholderImg from "@/components/atoms/placeholder";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { memo } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useParams } from "next/navigation";
import Link from "next/link";

function TopBackground({
  specialBanner,
}: { specialBanner: string | undefined }) {

  const customLink = useParams()?.businessId as string;

  return (
    <div className={"relative h-[20vh] w-screen overflow-hidden"}>
      {specialBanner ? (
        <Image
          src={specialBanner || ""}
          width={700}
          height={300}
          quality={95}
          objectFit="cover"
          className="mx-auto"
          alt={"miniBanner Image"}
          placeholder="blur"
          blurDataURL={getRandomBlurImg(700, 700)}
        />
      ) : (
        <PlaceholderImg className="w-full h-full" />
      )}
      {/* <Link href={`/${customLink}/explore`}>
        <div className="top-4  w-full absolute z-[60] flex flex-row px-4">
          <button type="button" className="">
            <BiArrowBack />
          </button>
        </div>
      </Link> */}
    </div>
  );
}

const MemoTopBackground = memo(TopBackground);
export default MemoTopBackground;
