"use client";
import React, { memo } from "react";
import Section from "@/components/molecules/section";
import type { IUniquelyDishes } from "@/components/types/businessData";
import { useParams, useRouter } from "next/navigation";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import type { DishType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";

interface Props {
  uniquelyDishes: IUniquelyDishes[] | undefined;
}

const baseGridOrder = ["first", "second", "third", "fourth", "fifth", "sixth"];

const getFigureClass = (imageCount: number): string => {
  return `explore-bento-${baseGridOrder[imageCount - 1] || "default"}`;
};

const DynamicImageGrid = ({ images }: { images: DishType[] }) => {
  const figureClass = getFigureClass(images.length);

  const customLink = useParams()?.businessId as string;
  const router = useRouter();

  const handleRecommendedDishClick = (id: string) => {
    router.push(routePaths[PAGE_TYPES.DISH_ID](customLink, id));
  };

  return (
    <figure className={cn(figureClass, "px-4")}>
      {images.map((item, index) => (
        <button
          type="button"
          style={{ overflow: "hidden", position: "relative" }}
          key={item._id?.toString()}
          className={baseGridOrder[index % baseGridOrder?.length]}
          onClick={() => handleRecommendedDishClick(item?._id?.toString())}
        >
          <img
            className="object-cover w-full h-full rounded-xl"
            src={item?.images?.[0]}
            alt={item.name}
          />
        </button>
      ))}
    </figure>
  );
};

const MemoUniquelyDishes = (props: Props) => {
  const { uniquelyDishes } = props;

  return (
    <Section title="Uniquely Yours" tag="h3">
      <div className="pt-4" />

      {uniquelyDishes && uniquelyDishes.length > 0 && (
        <DynamicImageGrid images={uniquelyDishes?.slice(0, 6)} />
      )}
    </Section>
  );
};

const UniquelyDishes = memo(MemoUniquelyDishes);
export default UniquelyDishes;
