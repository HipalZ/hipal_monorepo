"use client";

import { useState, useEffect, memo } from "react";
import ShimmerImage from "../atoms/imageshimmer";
import { useScreenSize } from "../hooks/useScreenSize";
import type { BusinessDetails } from "../types/businessData";
import { useHotelBusinessData } from "../store/useHotelBusinessData";

interface TopSectionProps {
  business: BusinessDetails;
  height?: string;
  className?: string;
}

// Using named export for better tree-shaking
export function TopSectionOfHotel({
  business,
  height = "h-[30rem]",
  className = "",
}: TopSectionProps) {
  const { specialBannerUrl } = business;
  const { setHotelData } = useHotelBusinessData();
  const [mediaState, setMediaState] = useState<{
    isVideo: boolean;
    isLoading: boolean;
    error: boolean;
  }>({
    isVideo: false,
    isLoading: true,
    error: !specialBannerUrl,
  });

  useEffect(() => {
    if (business) {
      setHotelData(business);
    }

    if (!specialBannerUrl) {
      setMediaState({ isVideo: false, isLoading: false, error: true });
      return;
    }

    const isVideoFile = /\.(mp4|webm|ogg|mov)$/i.test(specialBannerUrl);
    setMediaState({ isVideo: isVideoFile, isLoading: false, error: false });
  }, [specialBannerUrl]);

  const { isVideo, isLoading, error } = mediaState;

  if (isLoading) {
    return (
      <div className={`${height} w-full bg-muted animate-pulse ${className}`}>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !specialBannerUrl) {
    return (
      <div className={`${height} w-full bg-muted ${className}`}>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">No banner available</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${height} w-full overflow-hidden rounded-b-2xl relative ${className}`}
    >
      {isVideo ? (
        <VideoContent
          url={specialBannerUrl}
          logoUrl={business.logoUrl}
          businessName={business.name}
          businessDescription={business.description}
        />
      ) : (
        <ImageContent
          url={specialBannerUrl}
          logoUrl={business.logoUrl}
          businessName={business.name}
          businessDescription={business.description}
          tags={business?.tags}
        />
      )}
    </div>
  );
}

// Common interface for media content props
interface MediaContentProps {
  url: string;
  logoUrl?: string;
  businessName?: string;
  businessDescription?: string;
  tags?: string[];
}

// Business info component to avoid duplication
const BusinessInfo = memo(function BusinessInfo({
  logoUrl,
  businessName,
  businessDescription,
  tags,
}: {
  logoUrl?: string;
  businessName?: string;
  businessDescription?: string;
  tags?: string[];
}) {
  return (
    <div className="absolute bottom-6 left-4 flex items-end gap-4 max-w-[80%] z-10">
      {/* Logo */}
      {logoUrl && (
        <div className="flex-shrink-0 w-16 h-16 overflow-hidden border-2 rounded-full md:w-24 md:h-24 border-white/20 bg-black/30">
          <ShimmerImage
            src={logoUrl}
            alt={businessName || "Business logo"}
            className="object-cover w-full h-full"
            width={128}
            height={128}
          />
        </div>
      )}

      {/* Text content */}
      <div className="text-white ">
        {businessName && (
          <h1 className="text-xl font-bold md:text-3xl text-shadow font-play">
            {businessName}
          </h1>
        )}
        {tags && tags?.length > 0 && (
          <div className="text-sm font-semibold md:text-base text-white/70 text-shadow inter">
            {tags?.join(" | ")}
          </div>
        )}
        {businessDescription && (
          <p className="mt-1 text-sm md:text-base text-white/70 line-clamp-2 text-shadow inter">
            {businessDescription}
          </p>
        )}
      </div>
    </div>
  );
});

const VideoContent = memo(function VideoContent({
  url,
  logoUrl,
  businessName,
  businessDescription,
}: MediaContentProps) {
  const screenSize = useScreenSize();

  return (
    <div className="relative w-full h-full">
      <video
        src={url}
        className="object-cover w-full h-full"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />

      {/* Gradient overlay */}
      {screenSize !== "xs" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      )}

      {/* Business info container */}
      {(logoUrl || businessName || businessDescription) &&
        screenSize !== "xs" && (
          <BusinessInfo
            logoUrl={logoUrl}
            businessName={businessName}
            businessDescription={businessDescription}
          />
        )}
    </div>
  );
});

const ImageContent = memo(function ImageContent({
  url,
  logoUrl,
  businessName,
  businessDescription,
  tags,
}: MediaContentProps) {
  const screenSize = useScreenSize();

  return (
    <div className="relative w-full h-full ">
      <ShimmerImage
        src={url || "/placeholder.svg"}
        alt="Business banner"
        priority
        className="object-cover w-full h-full"
        // style={{
        //   objectPosition: screenSize !== 'xs' ? "0 -300px" : "center"
        // }}
        sizes="100dvw"
        width={1280}
        height={1080}
      />

      {/* Gradient overlay */}
      {screenSize !== "xs" && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      )}

      {/* Business info container */}
      {(logoUrl || businessName || businessDescription) &&
        screenSize !== "xs" && (
          <BusinessInfo
            logoUrl={logoUrl}
            businessName={businessName}
            businessDescription={businessDescription}
            tags={tags}
          />
        )}
    </div>
  );
});
