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
    <div className={"relative h-[20vh] overflow-hidden"}>
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
      <Link href={`/${customLink}/explore`}>
        <button type="button" className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]">
            <BiArrowBack />
          </button>
      </Link>
    </div>
  );
}

const MemoTopBackground = memo(TopBackground);
export default MemoTopBackground;
