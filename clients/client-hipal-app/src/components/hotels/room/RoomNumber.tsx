"use client";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css"; // Basic Splide styles
import ShimmerImage from "@/components/atoms/imageshimmer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion"
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useLogin } from "@/components/store/useLogin";
import { MapPin } from "lucide-react";
import HI from "@/assets/HiHand.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";

const isVideoUrl = (url: string) =>
  url.startsWith("data:video") ||
  /\.(mp4|webm|ogg|ogv|mov|m4v|avi|mkv)(?:$|[?#])/i.test(url) ||
  /video(?:\/|%2f)[a-z0-9.+-]+/i.test(url);

export default function RoomCard({
  roomNumber,
  specialBannerUrl,
  logoUrl,
  hotelBanners,
  businessData,
}: {
  roomNumber: string;
  specialBannerUrl: string;
  logoUrl?: string;
  hotelBanners: string[];
  businessData:any;
}) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [failedVideoUrls, setFailedVideoUrls] = useState<Set<string>>(new Set());
  const splideRef = useRef<any>(null);
  const guestName = useLogin((s) => s.userDetails?.name);
  const userDetails = useLogin((s) => s.userDetails);
  const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);
  const carouselItems = useMemo(
    () =>
      hotelBanners?.filter(Boolean)?.length
        ? hotelBanners.filter(Boolean)
        : [specialBannerUrl].filter(Boolean),
    [hotelBanners, specialBannerUrl],
  );
  const hasVideo = carouselItems.some(isVideoUrl);

  useEffect(() => {
    setBusinessDetails(businessData);
  }, [businessData, setBusinessDetails]);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [carouselItems]);

  const goToNextSlide = useCallback(() => {
    if (carouselItems.length <= 1) return;
    splideRef.current?.splide?.go(">");
  }, [carouselItems.length]);

  const handleVideoError = useCallback((mediaUrl: string) => {
    setFailedVideoUrls((prev) => {
      const next = new Set(prev);
      next.add(mediaUrl);
      return next;
    });
    goToNextSlide();
  }, [goToNextSlide]);

  useEffect(() => {
    if (!hasVideo || carouselItems.length <= 1) return;

    const activeMediaUrl = carouselItems[activeSlideIndex];
    if (isVideoUrl(activeMediaUrl)) return;

    const imageSlideTimer = window.setTimeout(goToNextSlide, 3500);
    return () => window.clearTimeout(imageSlideTimer);
  }, [activeSlideIndex, carouselItems, goToNextSlide, hasVideo]);
  
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex">
      <Splide
        ref={splideRef}
        className="w-full"
        options={{
          rewind: true,
          perPage: 1,
          arrows: false,
          pagination: carouselItems.length > 1,
          drag: "free",
          gap: "0.5rem",
          autoplay: !hasVideo && carouselItems.length > 1,
          interval: 3500,
          pauseOnHover: true,
          speed: 800,
          easing: "ease-in-out",
        }}
        onMounted={(splide) => setActiveSlideIndex(splide.index)}
        onMoved={(splide) => setActiveSlideIndex(splide.index)}
      >
        {carouselItems?.map((mediaUrl, i) => (
          <SplideSlide key={i?.toString()} className="w-full">
            {isVideoUrl(mediaUrl) ? (
              <div className="relative h-[16rem] w-full overflow-hidden rounded-[1.25rem]">
                {failedVideoUrls.has(mediaUrl) ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-500">
                    Video preview unavailable
                  </div>
                ) : (
                  <video
                    key={`${mediaUrl}-${i === activeSlideIndex ? "active" : "inactive"}`}
                    src={mediaUrl}
                    className="absolute inset-0 block h-full w-full object-cover"
                    autoPlay={i === activeSlideIndex}
                    muted
                    loop={carouselItems.length === 1}
                    playsInline
                    controls={false}
                    onEnded={goToNextSlide}
                    onError={() => handleVideoError(mediaUrl)}
                  />
                )}
              </div>
            ) : (
              <div className="relative h-[16rem] w-full overflow-hidden rounded-[1.25rem]">
                <ShimmerImage
                  src={mediaUrl}
                  alt={i?.toString()}
                  width={500}
                  height={180}
                  className="block h-full w-full object-cover"
                />
              </div>
            )}
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
