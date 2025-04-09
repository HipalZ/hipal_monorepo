"use client";
import React, { memo, useState } from "react";
import type { IUniquelyDishes } from "@/components/types/businessData";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@hi/common";
import { useActiveClass } from "@/components/store/useActiveClass";
import ShimmerImage from "@/components/atoms/imageshimmer";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import ItemDescriptionPopup from "@/components/atoms/dishDescription/itemDescription";
import ExploreItemDescription from "@/components/atoms/dishPopup/exploreItemDescription";
import useTableData from "@/components/store/useTableData";

interface Props {
  uniquelyDishes: IUniquelyDishes[] | undefined;
}

const baseGridOrder = ["first", "second", "third", "fourth", "fifth", "sixth"];

const getFigureClass = (imageCount: number): string => {
  return `explore-bento-${baseGridOrder[imageCount - 1] || "default"}`;
};

const DynamicImageGrid = ({ images }: { images: IUniquelyDishes[] }) => {
  const figureClass = getFigureClass(images.length);

  const {
    setActiveCategory,
    setObserverActive,
    setActiveChildCategory,
    isSelectedDish,
    setSelectedDish,
  } = useActiveClass();

  const customLink = useParams()?.businessId as string;
  const router = useRouter();
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const tableName = useTableData((s) => s.tableName);
  const handleRecommendedDishClick = (item: IUniquelyDishes) => {
    if (outletInfo?.outLetType !== "OTHER") {
      setActiveChildCategory(item?.dishId);
      setActiveCategory(item?.dishId);
      setObserverActive(false);
      router.push(`/${customLink}/category?${tableName ? `tableName=${tableName}` : ""}`);
    } else {
      setSelectedDish(item);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
          <ShimmerImage
            className="object-cover w-full h-full max-w-[30rem] max-h-[220px] rounded-xl"
            src={item?.images?.[0]}
            alt={item.name}
            width={480}
            height={480}
          />
        </button>
      ))}
      {isModalOpen && (
        <ItemDescriptionPopup show={isModalOpen} onClose={closeModal}>
          <div className="relative">
            <ExploreItemDescription dishData={isSelectedDish} />
          </div>
        </ItemDescriptionPopup>
      )}
    </figure>
  );
};

const MemoUniquelyDishes = (props: Props) => {
  const { uniquelyDishes } = props;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  return (
    <>
      <center className="relative pb-4 text-2xl text-primary">
        {outletInfo?.outLetType !== "OTHER"
          ? "Must Try Dishes"
          : "Our Favourites"}
      </center>
      {uniquelyDishes && uniquelyDishes.length > 0 && (
        <DynamicImageGrid images={uniquelyDishes?.slice(0, 6)} />
      )}
    </>
  );
};

const UniquelyDishes = memo(MemoUniquelyDishes);
export default UniquelyDishes;
