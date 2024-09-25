import { getRandomBlurImg } from "@/components/utils/images";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import "@splidejs/react-splide/css";

interface WallpaperCarouselProps {
  wallpapers: string[];
  isAvailable: boolean;
}

const WallpaperCarousel = ({
  wallpapers,
  isAvailable,
}: WallpaperCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(1);

  const totalSlides = wallpapers.length;

  // Standard image dimensions (maintaining 4:3 aspect ratio)
  const imageWidth = 420;
  const imageHeight = 315;

  // Function to render the image figure
  const renderImage = (wallpaper: string) => (
    <figure className="w-full -mt-0 overflow-hidden scale-90 aspect-square rounded-2xl">
      <Image
        src={wallpaper}
        className={`w-full h-full object-contain ${
          isAvailable ? "" : "grayscale"
        }`}
        alt="dish"
        quality={95}
        width={imageWidth}
        height={imageHeight}
        placeholder="blur"
        blurDataURL={getRandomBlurImg(500, 500)}
      />
      {!isAvailable && (
        <>
          <div className="absolute z-20 text-xl text-white bottom-4 left-4">
            Not Available
          </div>
          <div className="absolute bottom-0 w-full rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent h-1/2" />
        </>
      )}
    </figure>
  );

  if (totalSlides === 1) {
    const wallpaper = wallpapers[0];
    return renderImage(wallpaper);
  }

  return (
    <div className="relative">
      <Splide
        aria-label="Dish Images"
        options={{
          pagination: true,
          type: "loop",
          perPage: 1,
          drag: "free",
          snap: true,
        }}
        className="overflow-hidden"
        onMove={(splide) => {
          setCurrentSlide(splide.index + 1);
        }}
      >
        {wallpapers.map((wallpaper, index) => (
          <SplideSlide key={`${wallpaper}${index}`}>
            {renderImage(wallpaper)}
          </SplideSlide>
        ))}
      </Splide>

      {/* Slide Counter */}
      {totalSlides >= 1 && (
        <div className="absolute px-2 py-1 text-sm text-white bg-black rounded bg-opacity-80 top-2 right-2">
          {currentSlide}/{totalSlides}
        </div>
      )}
    </div>
  );
};

const MemoWallpaperCarousel = memo(WallpaperCarousel);
export default MemoWallpaperCarousel;
