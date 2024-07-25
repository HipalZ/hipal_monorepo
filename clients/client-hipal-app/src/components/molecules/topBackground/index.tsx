"use client";
import PlaceholderImg from "@/components/atoms/placeholder";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { getRandomBlurImg } from "@/components/utils/images";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { BiArrowBack } from "react-icons/bi";

function TopBackground({
  specialBanner,
}: { specialBanner: string | undefined }) {
  const router = useRouter();

  const businessData = useBusinessDetails((s) => s.businessDetails);

  const goBack = () => {
    router.push(`/${businessData.customLink}/explore`);
  };

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
      <div className="top-4  w-full absolute z-[60] flex flex-row px-4">
        <button onClick={goBack} type="button" className="">
          <BiArrowBack />
        </button>
      </div>
    </div>
  );
}

const MemoTopBackground = memo(TopBackground);
export default MemoTopBackground;
