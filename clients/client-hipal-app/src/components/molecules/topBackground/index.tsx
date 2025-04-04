"use client";
import PlaceholderImg from "@/components/atoms/placeholder";
import { memo, useCallback } from "react";
import { BiArrowBack } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useSearch } from "@/components/store/useSearch";
import ShimmerImage from "@/components/atoms/imageshimmer";

function TopBackground({
  specialBanner,
}: { specialBanner: string | undefined }) {
  const router = useRouter();

  const isVideo = useCallback((url: string) => {
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "flv", "wmv"];
    return videoExtensions.includes(url.split(".").pop()?.toLowerCase() || "");
  }, []);

  const { isSearchActive } = useSearch();

  return (
    <>
      {!isSearchActive && (
        <div className="relative h-[20vh] overflow-hidden">
          {isVideo(specialBanner || "") ? (
            <video
              src={specialBanner || ""}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <ShimmerImage
              src={specialBanner || ""}
              width={700}
              height={300}
              quality={95}
              objectFit="cover"
              className="mx-auto"
              alt={"miniBanner Image"}
            />
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
          >
            <BiArrowBack />
          </button>
        </div>
      )}
    </>
  );
}

const MemoTopBackground = memo(TopBackground);
export default MemoTopBackground;
