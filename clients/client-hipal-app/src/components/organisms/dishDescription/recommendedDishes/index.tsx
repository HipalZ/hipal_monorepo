import React, { memo, useMemo } from "react";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import Section from "@/components/molecules/section";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import Image from "next/image";
import { ImSpoonKnife } from "react-icons/im";
import DishQuantityButton from "../dishQuantityButton";
import PlaceholderImg from "@/components/atoms/placeholder";
import { getRandomBlurImg } from "@/components/utils/images";
import type { DishType } from "@hi/db-models/src/validators";
import "@splidejs/react-splide/css";
import ShimmerImage from "@/components/atoms/imageshimmer";

function RecommendedDishes({
  recommendations,
  openModal,
}: {
  recommendations: DishType[];
  openModal: (dish: DishType) => void;
}) {
  // Use useMemo to prepare the dishes for rendering
  const processedDishes = useMemo(() => {
    return recommendations?.map((dish: DishType) => ({
      ...dish,
      image: dish?.images.length > 0 ? dish?.images[0] : "",
      blurDataURL: getRandomBlurImg(150, 150),
    }));
  }, [recommendations]);

  if (processedDishes?.length === 0) return null;

  return (
    <div className="-mt-4">
      <Section title="" tag="h3">
        <div>
          <div className="flex flex-row gap-4 mb-4 text-primary">
            <ImSpoonKnife className="my-auto text-lg" />
            <h4 className="my-auto">Best Pair With</h4>
          </div>
          <Splide
            aria-labelledby="Special offers"
            options={{
              rewind: false,
              width: "100%",
              gap: "0.5rem",
              autoWidth: true,
              type: "slide",
              pagination: false,
              drag: "free",
              snap: true,
              arrows: false,
            }}
          >
            <div className="hidden splide__arrows">
              <button
                type="button"
                className="splide__arrow splide__arrow--prev"
              >
                Prev
              </button>
              <button
                type="button"
                className="splide__arrow splide__arrow--next"
              >
                Next
              </button>
            </div>
            {processedDishes?.map((dish) => (
              <SplideSlide key={dish._id?.toString()}>
                {dish && (
                  <div className="relative z-[100] text-primary">
                    <div className="absolute bg-white left-2 top-2 rounded-xl">
                      <FoodType types={dish?.dishTypes as FOOD_TYPES[]} />
                    </div>
                    <div className="z-10 px-2 pt-2 flex flex-col overflow-hidden bg-base-300 border w-[8.5rem] rounded-lg border-base-200 text-base-content">
                      <button
                        type="button"
                        onClick={() => openModal(dish)}
                        className="w-full -mb-4 overflow-hidden"
                      >
                        {dish?.image ? (
                          <ShimmerImage
                            src={dish?.image}
                            quality={95}
                            alt={dish?.name}
                            width={120}
                            height={120}
                            className="object-cover rounded-md aspect-[4/3]"
                          />
                        ) : (
                          <PlaceholderImg className="!w-[5.5rem] !h-[5.5rem] rounded-2xl" />
                        )}
                      </button>
                      <div className="mt-6 overflow-hidden text-xs font-medium text-left capitalize whitespace-nowrap overflow-ellipsis">
                        {dish?.name}
                      </div>
                      <div className="flex items-center justify-between w-full px-2">
                        <div className="text-xs">₹{dish?.price}</div>
                        <div className="mt-1 scale-75">
                          <DishQuantityButton dishData={dish} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </SplideSlide>
            ))}
          </Splide>
        </div>
      </Section>
    </div>
  );
}

const MemoRecommendedDishes = memo(RecommendedDishes);
export default MemoRecommendedDishes;
