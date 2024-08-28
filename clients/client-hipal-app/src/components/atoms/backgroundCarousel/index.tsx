import { getRandomBlurImg } from "@/components/utils/images";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Image from "next/image";
import { memo } from "react";
import "@splidejs/react-splide/css";

interface WallpaperCarouselProps {
  wallpapers: string[];
  isAvailable: boolean;
}

const WallpaperCarousel = ({
  wallpapers,
  isAvailable,
}: WallpaperCarouselProps) => {
  return (
    <Splide
      aria-label="My Favorite Images"
      options={{
        pagination: true,
        type: "loop",
        perPage: 1,
        drag: "free",
        snap: true,
        autoWidth: true,
      }}
      className="-mt-8 -ml-2 -mr-3 overflow-hidden no-scrollbar"
    >
      {wallpapers.length > 0 &&
        wallpapers.map(
          (wallpaper, index) =>
            !!wallpaper && (
              <SplideSlide key={`${wallpaper}${index}`}>
                <>
                  <figure className="w-[100%] min-w-[100vw] max-w-[28rem] h-[20rem] overflow-hidden">
                    <Image
                      src={wallpaper}
                      className={`object-cover w-full max-w-[28rem] ${
                        isAvailable ? "" : "grayscale"
                      } `}
                      alt="dish"
                      quality={95}
                      width={420}
                      height={320}
                      placeholder="blur"
                      blurDataURL={getRandomBlurImg(500, 500)}
                    />
                  </figure>
                  {!isAvailable && (
                    <>
                      <div className="absolute z-20 text-xl text-white bottom-4 left-4">
                        Not Available
                      </div>
                      <div className="absolute w-full bottom-2 rounded-b-2xl bg-gradient-to-t from-black via-black/70 to-transparent h-1/2" />
                    </>
                  )}
                </>
              </SplideSlide>
            ),
        )}
    </Splide>
  );
};

const MemoWallpaperCarousel = memo(WallpaperCarousel);
export default MemoWallpaperCarousel;
