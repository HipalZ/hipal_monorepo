"use client";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css"; // Basic Splide styles
import ShimmerImage from "@/components/atoms/imageshimmer";

export default function RoomCard({
  roomNumber,
  specialBannerUrl,
  logoUrl,
  hotelBanners,
}: {
  roomNumber: string;
  specialBannerUrl: string;
  logoUrl?: string;
  hotelBanners: string[];
}) {
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
              className="w-full h-full object-cover"
              style={{ borderRadius: "1.25rem" }}
            />
          </SplideSlide>
        ))}
      </Splide>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20" />
      <div className="poppins-regular absolute bottom-2 left-2 bg-white rounded-xl px-2 py-0.5 text-xs font-normal shadow-lg text-h-primary z-50">
        {roomNumber}
      </div>
      {logoUrl && (
        <div className="absolute top-2 right-2 z-50">
          <ShimmerImage
            src={logoUrl}
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg shadow-md object-contain bg-white p-1"
          />
        </div>
      )}
    </div>
  );
}
