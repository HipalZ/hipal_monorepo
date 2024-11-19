import { memo, useCallback, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import ShimmerImage from "@/components/atoms/imageshimmer";
import type { IDish } from "@/components/types/businessData";
import Img from "@/assets/img/cake.png";
import DishQuantityButton from "../../dishDescription/dishQuantityButton";
import MemoFoodType from "@/components/atoms/foodType";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const MemoLivePreview = ({ dish }: { dish: IDish }) => {
  const [dominantColor, setDominantColor] = useState(
    "rgba(255, 255, 255, 0.9)",
  );
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const extractColor = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image || !dish) return;

      const fac = new FastAverageColor();
      fac
        .getColorAsync(image)
        .then((color) => {
          setDominantColor(
            `rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.5)`,
          );
        })
        .catch((e) => {
          console.error("Error extracting color:", e);
        });
    },
    [dish],
  );

  const handleImageLoad = (
    event: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    extractColor(event.currentTarget);
  };

  if (!dish) {
    return <p className="text-center text-gray-500">Dish not found</p>;
  }

  return (
    <figure
      key={dish?.name}
      className="relative w-full flex-2 max-w-[85%] md:max-w-[20rem] mt-16 md:mt-[4rem] rounded-2xl overflow-hidden border border-[#ffffff30]"
    >
      <div className="w-full aspect-[2/3] overflow-hidden">
        <ShimmerImage
          src={dish?.images?.[0] || Img}
          alt={dish?.name}
          width={350}
          height={233}
          className="object-contain w-full h-full embla-_slide__img embla-_parallax__img"
          onLoad={handleImageLoad}
          style={{
            objectPosition: "50% 0%",
          }}
        />
      </div>
      {dish?.dishTypes && outletInfo?.outLetType !== "OTHER" && (
        <div className="absolute p-1 bg-white rounded-lg top-2 left-2">
          <MemoFoodType types={dish?.dishTypes} />
        </div>
      )}
      <div
        className="absolute bottom-0 w-full h-[9rem] md:h-[10rem] lg:h-[10rem] rounded-b-2xl z-20"
        style={{ backgroundColor: dominantColor }}
      />

      <figcaption className="z-40 absolute bottom-0 w-full h-[10rem] md:h-[9rem] lg:h-[9rem] max-w-[94%] md:max-w-[95%] p-3 m-2 bg-white shadow-md rounded-xl">
        <h2 className="text-xl font-bold leading-5 text-gray-900 space-grotesk-700">
          {dish.name}
        </h2>
        <p className="mt-2 text-sm text-black opacity-70 md:text-sm line-clamp-2">
          {dish.description}
        </p>
        <p className="absolute z-40 mt-2 font-bold text-gray-800 text-md md:text-lg left-4 bottom-4">
          ₹ {dish.price}
        </p>
      </figcaption>

      <div className="absolute z-40 px-3 py-1 text-sm scale-90 rounded-lg md:right-5 bottom-4 lg:right-5 right-2">
        <DishQuantityButton dishData={dish} />
      </div>
    </figure>
  );
};

const LivePreview = memo(MemoLivePreview);
export default LivePreview;
