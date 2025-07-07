"use client";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css"; // Basic Splide styles

import RoomImage1 from "@/assets/hotel/roomImage.jpeg";
import RoomImage2 from "@/assets/hotel/roomImage.jpeg";
import RoomImage3 from "@/assets/hotel/roomImage.jpeg";
import ShimmerImage from "@/components/atoms/imageshimmer";

const images = [
  { src: RoomImage1, alt: "Room view 1" },
  { src: RoomImage2, alt: "Room view 2" },
  { src: RoomImage3, alt: "Room view 3" },
];

export default function RoomCard({
  roomNumber,
  specialBannerUrl,
}: { roomNumber: string; specialBannerUrl: string }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden flex">
      <Splide
        options={{
          type: "loop",
          perPage: 1,
          arrows: false,
          pagination: true,
          drag: "free",
          gap: "0.5rem",
          autoplay: true,
          interval: 3500,
          pauseOnHover: true,
        }}
        className="w-full h-[15rem]"
      >
        {images.map((img, i) => (
          <SplideSlide key={i?.toString()}>
            <ShimmerImage
              src={specialBannerUrl}
              alt={img.alt}
              width={500}
              height={180}
              className="w-full h-full object-cover"
              style={{ borderRadius: "1.25rem" }}
            />
          </SplideSlide>
        ))}
      </Splide>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      <div className="poppins-regular absolute bottom-2 left-2 bg-white/80 rounded-xl px-2 py-0.5 text-xs font-normal shadow-lg text-h-primary z-50">
        {roomNumber}
      </div>
    </div>
  );
}
