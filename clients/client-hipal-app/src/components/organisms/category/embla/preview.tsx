import { memo, useEffect, useRef, useState } from "react";
import { BiPlus } from "react-icons/bi";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";

const MemoLivePreview = ({ dish }: { dish: any }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dominantColor, setDominantColor] = useState(
    "rgba(255, 255, 255, 0.9)",
  );

  // Color extraction logic
  useEffect(() => {
    if (!imgRef.current || !dish) return;

    const fac = new FastAverageColor();
    fac
      .getColorAsync(imgRef.current)
      .then((color) => {
        setDominantColor(
          `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]},0.5)`,
        );
      })
      .catch((e) => {
        console.error("Error extracting color:", e);
      });
  }, [dish]);

  if (!dish) {
    return <p className="text-center text-gray-500">Dish not found</p>;
  }

  return (
    <figure
      key={dish.name}
      className="relative w-full flex-2 max-w-[85%] md:max-w-[20rem] mt-16 md:mt-[4rem] rounded-2xl overflow-hidden border border-[#ffffff30]"
    >
      <div className="w-full aspect-[2/3] overflow-hidden">
        <Image
          ref={imgRef}
          src={dish?.images[0]}
          alt={dish.name}
          width={350}
          height={233}
          className="object-contain w-full h-full embla-_slide__img embla-_parallax__img"
          style={{
            objectPosition: "50% 0%",
          }}
        />
      </div>

      <div
        className="absolute bottom-0 w-full h-[9rem] md:h-[10rem] lg:h-[10rem] rounded-b-2xl z-20"
        style={{ backgroundColor: dominantColor }}
      />

      <figcaption className="z-40 absolute bottom-0 w-full h-[10rem] md:h-[9rem] lg:h-[9rem] max-w-[94%] md:max-w-[95%] p-3 m-2 bg-white shadow-md rounded-xl">
        <h2 className="text-xl font-bold leading-5 text-gray-900 space-grotesk-700">
          {dish.name}
        </h2>
        <p className="mt-2 text-sm text-black opacity-70 md:text-sm">
          {dish.description}
        </p>
        <p className="absolute z-40 mt-2 font-bold text-gray-800 text-md md:text-lg left-4 bottom-4">
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

const LivePreview = memo(MemoLivePreview);
export default LivePreview;
