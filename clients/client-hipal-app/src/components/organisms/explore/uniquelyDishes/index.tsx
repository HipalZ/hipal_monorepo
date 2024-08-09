"use client";
import React, { memo } from "react";
import Section from "@/components/molecules/section";
import type { IUniquelyDishes } from "@/components/types/businessData";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@hi/common";
import { useActiveClass } from "@/components/store/useActiveClass";
import Image from "next/image";

interface Props {
  uniquelyDishes: IUniquelyDishes[] | undefined;
}

const baseGridOrder = ["first", "second", "third", "fourth", "fifth", "sixth"];

const getFigureClass = (imageCount: number): string => {
  return `explore-bento-${baseGridOrder[imageCount - 1] || "default"}`;
};

const DynamicImageGrid = ({ images }: { images: IUniquelyDishes[] }) => {
  const figureClass = getFigureClass(images.length);

  const { setActiveCategory } = useActiveClass();

  const customLink = useParams()?.businessId as string;
  const router = useRouter();

  const handleRecommendedDishClick = (item: IUniquelyDishes) => {
    setActiveCategory(item?.dishId);
    router.push(`/${customLink}/category`);
  };

  return (
    <figure className={cn(figureClass, "px-4")}>
      {images.map((item, index) => (
        <button
          type="button"
          style={{ overflow: "hidden", position: "relative" }}
          key={item._id?.toString()}
          className={baseGridOrder[index % baseGridOrder?.length]}
          onClick={() => handleRecommendedDishClick(item)}
        >
          <Image
            className="object-cover w-full h-full rounded-xl"
            src={item?.images?.[0]}
            alt={item.name}
            width={400}
            height={400}
          />
        </button>
      ))}
    </figure>
  );
};

const MemoUniquelyDishes = (props: Props) => {
  const { uniquelyDishes } = props;

  return (
    <>
      <center className="pb-8 text-2xl text-primary">Must Try Dishes</center>
      {uniquelyDishes && uniquelyDishes.length > 0 && (
        <DynamicImageGrid images={uniquelyDishes?.slice(0, 6)} />
      )}
    </>
  );
};

const UniquelyDishes = memo(MemoUniquelyDishes);
export default UniquelyDishes;
