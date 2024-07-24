"use client";
import React, { memo } from "react";
import Section from "@/components/molecules/section";
import type { IUniquelyDishes } from "@/components/types/businessData";
import DiscountDishCard from "@/components/molecules/discountDishCard";
import { useParams, useRouter } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import EmblaCarousel from "@/components/atoms/emblaCarousel";

interface Props {
  uniquelyDishes: IUniquelyDishes[] | undefined;
}
const MemoUniquelyDishes = (props: Props) => {
  const customLink = useParams()?.businessId as string;
  const { uniquelyDishes } = props;
  const router = useRouter();
  const handleRecommendedDishClick = (id: string) => {
    router.push(routePaths[PAGE_TYPES.DISH_ID](customLink, id));
  };
  return (
    <section className="mt-6 no-scrollbar">
      <Section title="Uniquely Yours" tag="h3">
        <div className="flex">
          <EmblaCarousel>
            {uniquelyDishes?.map((dishData: IUniquelyDishes, key: number) => (
              <div key={`${key}FilterPopularDishes${dishData?._id || ""}`}>
                {dishData && (
                  <DiscountDishCard
                    dishData={dishData}
                    onClick={() => handleRecommendedDishClick(dishData._id)}
                  />
                )}
              </div>
            ))}
          </EmblaCarousel>
        </div>
      </Section>
    </section>
  );
};

const UniquelyDishes = memo(MemoUniquelyDishes);
export default UniquelyDishes;
