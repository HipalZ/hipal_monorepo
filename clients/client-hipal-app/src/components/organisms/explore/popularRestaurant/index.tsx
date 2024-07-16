"use client";
import page from "@/app/[businessId]/user/otp/page";
import DiscountDishCard from "@/components/molecules/discountDishCard";
import Section from "@/components/molecules/section";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { IDish } from "@/components/types/businessData";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { useRouter } from "next/navigation";
import { memo } from "react";

interface IPopularRestProps {
  popular: any | undefined;
}
function PopularRestaurant(props: IPopularRestProps) {
  const customLink = useBusinessDetails((s) => s.businessDetails?.customLink);
  const { popular } = props;
  const router = useRouter();
  const handleRecommendedDishClick = (id: string) => {
    router.push(routePaths[PAGE_TYPES.DISH_ID](customLink, id));
  };

  return (
    <section className="mt-6 no-scrollbar">
      <Section title="Uniquely Yours" tag="h3">
        <div className="no-scrollbar">
          <Splide
            aria-labelledby="Special offers"
            options={{
              rewind: false,
              width: "100%",
              gap: "0.75rem",
              padding: "1rem",
              perPage: 2,
              perMove: 1,
              autoWidth: true,
              classes: {
                pagination: "splide__pagination",
                page: "splide__pagination__page",
              },
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
              {popular?.map((dishData: IDish, key: number) => (
                <SplideSlide
                  key={`${key}FilterPopularDishes${dishData?._id || ""}`}
                >
                  {dishData && (
                    <DiscountDishCard
                      dishData={dishData}
                      onClick={() => handleRecommendedDishClick(dishData._id)}
                    />
                  )}
                </SplideSlide>
              ))}
          </Splide>
        </div>
      </Section>
    </section>
  );
}

const MemoPopularRestaurant = memo(PopularRestaurant);
export default MemoPopularRestaurant;
