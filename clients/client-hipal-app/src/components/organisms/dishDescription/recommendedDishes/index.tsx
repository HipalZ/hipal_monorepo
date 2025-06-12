"use client";
import { memo, useMemo } from "react";
import FoodType, { type FOOD_TYPES } from "@/components/atoms/foodType";
import Section from "@/components/molecules/section";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { ImSpoonKnife } from "react-icons/im";
import DishQuantityButton from "../dishQuantityButton";
import type { DishType } from "@hi/db-models/src/validators";
import "@splidejs/react-splide/css";
import ShimmerImage from "@/components/atoms/imageshimmer";
import { useActiveClass } from "@/components/store/useActiveClass";
import { useDishesStore } from "@/components/store/useDishesStore";
import type { IDish } from "@/components/types/businessData";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

interface RecommendedDishesProps {
  recommendations: DishType[];
  openModal?: (dish: DishType) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

function RecommendedDishes({
  recommendations,
  openModal,
  primaryColor = "#ec4899",
  secondaryColor = "#fce7f3",
}: RecommendedDishesProps) {
  // Use useMemo to prepare the dishes for rendering
  const { setSelectedDish } = useActiveClass();
  const dishes = useDishesStore((s) => s.dishes);
  const currencySymbol = _useAllBusiness(
    (s) => s.data?.outletInfo?.currencySymbol,
  );
  const changeTheDish = (dish: DishType) => {
    if (openModal) {
      openModal(dish);
    } else {
      setSelectedDish(dish);
    }
  };

  const processedDishes = useMemo(() => {
    return recommendations
      ?.map((dishId) => dishes?.find((dish: IDish) => dish._id === dishId))
      .filter(Boolean);
  }, [recommendations, dishes]);

  if (!processedDishes || processedDishes.length === 0) return null;

  return (
    <div className="py-4" style={{ backgroundColor: `${secondaryColor}10` }}>
      <Section title="" tag="h3">
        <div>
          <div className="flex flex-row items-center gap-4 mb-4">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ backgroundColor: primaryColor, color: secondaryColor }}
            >
              <ImSpoonKnife className="text-lg" />
            </div>
            <h4
              className="text-base font-medium"
              style={{ color: primaryColor }}
            >
              Best Pair With
            </h4>
          </div>
          <Splide
            aria-labelledby="Special offers"
            options={{
              rewind: false,
              width: "100%",
              gap: "0.75rem",
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
                  <div className="relative z-[100]">
                    <div className="absolute bg-white shadow-sm left-2 top-2 rounded-xl">
                      <FoodType types={dish?.dishTypes as FOOD_TYPES[]} />
                    </div>
                    <div
                      className="z-10 px-2 pt-2 flex flex-col overflow-hidden border w-[9rem] rounded-lg text-base-content shadow-sm"
                      style={{
                        borderColor: `${primaryColor}20`,
                        backgroundColor: "white",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => changeTheDish(dish)}
                        className="w-full -mb-4 overflow-hidden"
                      >
                        {dish?.images?.length > 0 ? (
                          <ShimmerImage
                            src={dish?.images?.[0]}
                            quality={95}
                            alt={dish?.name}
                            width={120}
                            height={120}
                            className="object-cover rounded-md aspect-[4/3]"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center w-full h-24 rounded-md"
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <span style={{ color: primaryColor }}>
                              {dish?.name?.charAt(0)?.toUpperCase() || "D"}
                            </span>
                          </div>
                        )}
                      </button>
                      <div
                        className="mt-6 overflow-hidden text-xs font-medium text-left capitalize whitespace-nowrap overflow-ellipsis"
                        style={{ color: primaryColor }}
                      >
                        {dish?.name}
                      </div>
                      <div className="flex items-center justify-between w-full pb-2 pr-2">
                        {Number(dish?.price) > 1 && (
                          <div
                            className="text-xs font-medium"
                            style={{ color: primaryColor }}
                          >
                            {currencySymbol}
                            {dish?.price}
                          </div>
                        )}
                        <div className="mt-1 origin-right scale-75">
                          <DishQuantityButton
                            dishData={dish}
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                          />
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
