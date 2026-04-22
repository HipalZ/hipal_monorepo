"use client";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css"; // Basic Splide styles
import ShimmerImage from "@/components/atoms/imageshimmer";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion"
import BottomPopUp from "@/components/atoms/bottomPopUp";
import { useLogin } from "@/components/store/useLogin";
import { MapPin } from "lucide-react";
import HI from "@/assets/HiHand.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";

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
  const guestName = useLogin((s) => s.userDetails?.name);
  const userDetails = useLogin((s) => s.userDetails);
  const setBusinessDetails = useBusinessDetails((s) => s.setBusinessDetails);

  useEffect(() => {
    setBusinessDetails(businessData);
  }, [businessData, setBusinessDetails]);
  
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex">
      <Splide
        options={{
          rewind: true,
          perPage: 1,
          arrows: false,
          pagination: true,
          drag: "free",
          gap: "0.5rem",
          autoplay: true,
          interval: 3500,
          pauseOnHover: true,
          speed: 800,
          easing: "ease-in-out",
        }}
      >
        {hotelBanners?.map((img, i) => (
          <SplideSlide key={i?.toString()}>
            <ShimmerImage
              src={img || specialBannerUrl}
              alt={i?.toString()}
              width={500}
              height={180}
              className="w-full max-h-[16rem] object-cover"
              style={{ borderRadius: "1.25rem" }}
            />
          </SplideSlide>
        ))}
      </Splide>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
      {/* <div className="poppins-regular absolute bottom-2 left-2 bg-white rounded-xl px-4 !font-semibold py-[0.5rem] text-sm shadow-lg text-[#000000] z-50">
        {roomNumber}
      </div> */}
      {logoUrl && (
        <div className="absolute top-2 left-2 z-50">
          <ShimmerImage
            src={logoUrl}
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-md object-contain bg-white p-1"
          />
        </div>
      )}
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
