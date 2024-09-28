"use client";
import React, { memo } from "react";
import Section from "@/components/molecules/section";
import type { IUniquelyDishes } from "@/components/types/businessData";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@hi/common";
import { useActiveClass } from "@/components/store/useActiveClass";
import Image from "next/image";
import useBusinessDetails from "@/components/store/useBusinessDetails";

interface Props {
  uniquelyDishes: IUniquelyDishes[] | undefined;
}

const baseGridOrder = ["first", "second", "third", "fourth", "fifth", "sixth"];

const getFigureClass = (imageCount: number): string => {
  return `explore-bento-${baseGridOrder[imageCount - 1] || "default"}`;
};

const DynamicImageGrid = ({ images }: { images: IUniquelyDishes[] }) => {
  const figureClass = getFigureClass(images.length);

  const { setActiveCategory, setObserverActive, setActiveChildCategory } =
    useActiveClass((s) => ({
      setActiveCategory: s.setActiveCategory,
      setObserverActive: s.setObserverActive,
      setActiveChildCategory: s.setActiveChildCategory,
    }));

  const customLink = useParams()?.businessId as string;
  const router = useRouter();

  const handleRecommendedDishClick = (item: IUniquelyDishes) => {
    setActiveChildCategory(item?.dishId);
    setActiveCategory(item?.dishId);
    setObserverActive(false);
    console.log("customLink", item?.dishId);
    router.push(`/${customLink}/category`);
  };

  return (
    <figure className={cn(figureClass, "px-4")}>
      {images.map((item, index) => (
        <button
          type="button"
          style={{ position: "relative" }}
          key={item._id?.toString()}
          className={baseGridOrder[index % baseGridOrder?.length]}
          onClick={() => handleRecommendedDishClick(item)}
        >
          <Image
            className="object-cover w-full h-full max-w-[30rem] max-h-[220px] rounded-xl"
            src={item?.images?.[0]}
            alt={item.name}
            width={480}
            height={480}
          />
        </button>
      ))}
    </figure>
  );
};

const MemoUniquelyDishes = (props: Props) => {
  const { uniquelyDishes } = props;

  const outletType = useBusinessDetails((s) => s.businessDetails.outLetType);
  console.log("outletType", outletType);

  return (
    <>
      <center className="pb-4 text-2xl text-primary">
        {outletType === "MENU" ? "Must Try Dishes" : "Our Favourites"}
      </center>
      {uniquelyDishes && uniquelyDishes.length > 0 && (
        <DynamicImageGrid images={uniquelyDishes?.slice(0, 6)} />
      )}
    </>
  );
};

const UniquelyDishes = memo(MemoUniquelyDishes);
export default UniquelyDishes;
