"use client";
import { memo, useCallback, useEffect } from "react";
import { useSearch } from "@/components/store/useSearch";
import ShimmerImage from "@/components/atoms/imageshimmer";
import type { IBusinessData } from "@/components/types/businessData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import useBusinessDetails from "@/components/store/useBusinessDetails";

function TopBackground({
  specialBanner,
  businessData,
}: { specialBanner: string | undefined; businessData: IBusinessData }) {
  const setBusinessData = _useAllBusiness((s) => s.setData);
  const { setBusinessDetails } = useBusinessDetails();
  const isVideo = useCallback((url: string) => {
    const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "flv", "wmv"];
    return videoExtensions.includes(url.split(".").pop()?.toLowerCase() || "");
  }, []);

  const { isSearchActive } = useSearch();

  useEffect(() => {
    setBusinessData(businessData);
    if (businessData?.business) {
      setBusinessDetails(businessData?.business);
    }
  }, [businessData,
    setBusinessData,
    setBusinessDetails
  ]);

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
        </div>
      )}
    </>
  );
}

const MemoTopBackground = memo(TopBackground);
export default MemoTopBackground;
