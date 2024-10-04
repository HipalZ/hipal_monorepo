import { memo, useEffect, useRef, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FastAverageColor } from "fast-average-color";

const MemoBannerPreview = ({ dish }: { dish: any }) => {
  const imgRef = useRef(null);
  const [dominantColor, setDominantColor] = useState(
    "rgba(255, 255, 255, 0.9)",
  );

  useEffect(() => {
    if (imgRef.current) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          setDominantColor(
            `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.5)`,
          );
        })
        .catch((e) => {
          console.error("Error extracting color:", e);
        });
    }
  }, []);
  return (
    <figure
      key={dish.name}
      className="relative w-full flex-2 max-w-[14rem] md:max-w-[20rem] mt-16 md:mt-[4rem] rounded-2xl overflow-hidden border border-[#ffffff30]"
    >
      <div className="w-full aspect-[2/3] overflow-hidden">
        <img
          ref={imgRef}
          src={dish.images[0]}
          alt={`${dish.name}`}
          className="object-contain w-full h-full embla__slide__img embla__parallax__img"
          style={{
            objectPosition: "50% 0%",
          }}
        />
      </div>

      <div
        className="absolute bottom-0 w-full h-[7rem] md:h-[10rem] lg:h-[10rem] rounded-b-2xl z-20"
        style={{ backgroundColor: dominantColor }}
      />

      <figcaption className="z-40 absolute bottom-0 w-full max-w-[93%] p-3 m-2 bg-white shadow-md rounded-xl">
        <h2 className="text-base font-bold text-gray-900 space-grotesk-700">
          {dish.name}
        </h2>
        <p className="text-xs text-gray-600 md:text-sm">{dish.description}</p>
        <p className="mt-2 font-bold text-gray-800 text-md md:text-lg">
          ₹ {dish.price}
        </p>
      </figcaption>
      <button
        className="absolute z-40 flex items-center justify-center font-semibold px-3 py-1 text-sm bg-white border border-black/[0.1] md:right-7 rounded-lg bottom-5 lg:right-7 right-4"
        type="button"
      >
        <span>Add</span> <BiPlus className="ml-1" />
      </button>
    </figure>
  );
};

const BannerPreview = memo(MemoBannerPreview);

export default BannerPreview;
