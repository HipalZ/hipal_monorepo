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

function RecommendedDishes({
  recommendations,
  openModal,
}: {
  recommendations: DishType[];
  openModal: (dish: DishType) => void;
}) {
  // Use useMemo to prepare the dishes for rendering
  const processedDishes = useMemo(() => {
    return recommendations.map((dish: DishType) => ({
      ...dish,
      image: dish?.images.length > 0 ? dish?.images[0] : "",
      blurDataURL: getRandomBlurImg(150, 150),
    }));
  }, [recommendations]);

  if (processedDishes.length === 0) return null;

  return (
    <div className="-mt-6">
      <Section title="" tag="h3">
        <div className="">
          <div className="flex flex-row gap-4 mb-4 text-primary">
            <ImSpoonKnife className="my-auto text-lg" />
            <h4 className="my-auto">Best Pair With</h4>
          </div>
          <Splide
            aria-labelledby="Special offers"
            options={{
              rewind: false,
              width: "100%",
              gap: "0.25rem",
              autoWidth: true,
              type: 'slide',
              pagination: false,
              drag: 'free',
              snap: true,
              arrows: false,
            }}
          >
            <div className="hidden splide__arrows">
              <button type="button" className="splide__arrow splide__arrow--prev">Prev</button>
              <button type="button" className="splide__arrow splide__arrow--next">Next</button>
            </div>
            {processedDishes?.map((dish) => (
              <SplideSlide key={dish._id?.toString()}>
                {dish && (
                  <div className="relative z-[100] text-primary">
                    <div className="absolute bg-white left-2 top-2">
                      <FoodType types={dish?.dishTypes as FOOD_TYPES[]} />
                    </div>
                    <div className="z-10 flex flex-col overflow-hidden bg-white border w-[8.5rem] rounded-xl h-44 border-base-200">
                      <div
                        onClick={() => openModal(dish)}
                        className="w-full h-32 overflow-hidden"
                      >
                        {dish?.image ? (
                          <div className="px-2 pt-2 rounded-t-xl">
                            <Image
                              src={dish?.image}
                              layout="object-fit"
                              quality={95}
                              objectFit="cover"
                              alt={dish?.name}
                              placeholder="blur"
                              blurDataURL={dish?.blurDataURL}
                              width={150}
                              height={150}
                            />
                          </div>
                        ) : (
                          <PlaceholderImg className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-grow p-1 text-start">
                        <div className="overflow-hidden text-xs font-medium capitalize whitespace-nowrap overflow-ellipsis">
                          {dish?.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-2 pb-2 mt-2">
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
