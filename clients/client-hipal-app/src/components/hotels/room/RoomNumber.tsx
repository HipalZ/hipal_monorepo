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
  const [userModal, setUserModal] = useState<boolean>(false);
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
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
      {
        <BottomPopUp
          height="30rem"
          show={userModal}
          onClose={() => setUserModal(false)}
        >
          <div className=" !poppins-regular">
            {/* Header */}
             <motion.div
            className="relative z-10 flex gap-2 items-start rounded-t-2xl px-4 bg-gradient-to-r from-purple-200 to-purple-50 pt-4 pb-4 overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="w-11 h-11 bg-white rounded-full border flex items-center justify-center shadow-lg"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-bold text-xl text-black poppins-regular uppercase">
                {(guestName?.[0] || "G").toUpperCase()}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <motion.p
                className="text-black text-xl poppins-regular !font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {guestName || "Guest User"}
              </motion.p>
              <motion.p
                className="text-xs text-black poppins-regular"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {userDetails?.phone}
              </motion.p>
            </motion.div>

            <motion.div
              className="absolute bottom-2 right-4"
              initial={{
                opacity: 0,
                scale: 0,
                rotate: -45,
                x: 20,
                y: 20,
              }}
              animate={{
                opacity: 0.8,
                scale: 1,
                rotate: 0,
                x: 0,
                y: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.6,
                type: "spring",
                stiffness: 150,
                damping: 12,
              }}
              whileHover={{
                scale: 1.1,
                rotate: [0, -10, 10, -5, 0],
                transition: { duration: 0.5 },
              }}
            >
              <Image src={HI || "/placeholder.svg"} alt="Hi" width={52} height={52} className="mix-blend-screen" />
            </motion.div>
          </motion.div>

            {/* User Details */}
            <div className="space-y-4 poppins-regular p-6">
              {/* Room Number */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room Number</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {roomNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </BottomPopUp>
      }
    </div>
  );
}
