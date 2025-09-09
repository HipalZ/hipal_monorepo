"use client";
import dynamic from "next/dynamic";
import { type FC, memo, useMemo } from "react";
import type { CategoryType } from "@hi/db-models/src/validators";
import { cn } from "@hi/common";
import SubTypes from "@/components/molecules/categoryTypes/subTypes";
import { useSearch } from "@/components/store/useSearch";
import type { IMenuLayout, TimingType } from "@/components/types/businessData";
import Header from "@/components/molecules/header";
import { useDishesStore } from "@/components/store/useDishesStore";

const EdgeFlow = dynamic(() => import("./EdgeFlow"));
const MainTypes = dynamic(
  () => import("@/components/molecules/categoryTypes/mainTypes"),
);
const CollapseMenu = dynamic(() => import("./CollapseMenu"));

interface IDishesProps {
  childCategory: CategoryType[];
  parentCategory: CategoryType[];
  timings: TimingType;
  menuLayout: IMenuLayout;
}

const DishesList = ({
  childCategory,
  parentCategory,
  menuLayout,
}: IDishesProps) => {
  const { isSearchActive } = useSearch();

  console.log("Menu Layout:", menuLayout);

  const primaryColor = menuLayout?.primaryColor || "#ec4899";
  const secondaryColor = menuLayout?.secondaryColor || "#fce7f3";

  const categoryLayout = menuLayout?.categoryLayout;
  const isEdgeLayout = categoryLayout === 1;
  const isClassicLayout = categoryLayout === 2;
  const isCollapseLayout = categoryLayout === 3;

  const isHorizontalCard = menuLayout?.cardLayout === 1;
  const { setDishes } = useDishesStore();

  const subTypes = useMemo(() => {
    const hasVisibleDishes = (category: CategoryType): boolean => {
      return (
        category.hierarchy === "CHILD" &&
        category.dishIds &&
        category.dishIds.length > 0
      );
    };

    if (parentCategory && parentCategory.length > 0) {
      const uniqueSubCategoryIds = new Set<string>();

      for (const parentCat of parentCategory) {
        if (parentCat.subCategoryIds && parentCat.subCategoryIds.length > 0) {
          for (const id of parentCat.subCategoryIds) {
            uniqueSubCategoryIds.add(id);
          }
        }
      }

      const orderedSubTypes = Array.from(uniqueSubCategoryIds)
        .map((subCatId: string) => {
          return childCategory.find(
            (childCat: CategoryType) => childCat._id === subCatId,
          );
        })
        .filter((cat): cat is CategoryType => Boolean(cat));

      return orderedSubTypes.filter(hasVisibleDishes);
    }
    return childCategory?.filter(hasVisibleDishes);
  }, [childCategory, parentCategory]);
  

  useMemo(() => {
    const allDishes = childCategory
      .filter((category) => category.dishIds && category.dishIds.length > 0)
      .flatMap((category) => category.dishIds || []);
    setDishes(allDishes);
  }, [childCategory, setDishes]);

  return (
    <>
      <section className={cn("sticky z-50 text-[#000000] bg-white top-0")}>
        <Header
          categories={childCategory}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </section>

      {isClassicLayout && (
        <>
          {!isSearchActive && (
            <SubTypes
              childCategory={subTypes}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              isHorizontalCard={!isHorizontalCard}
            />
          )}
        </>
      )}

      {isEdgeLayout && (
        <EdgeFlow
          childCategory={subTypes}
          isHorizontalCard={!isHorizontalCard}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}

      {isCollapseLayout && (
        <CollapseMenu
          parentCategories={parentCategory || []}
          childCategories={childCategory || []}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}

      {!isCollapseLayout && (
        <MainTypes
          parentCategory={parentCategory || []}
          childCategory={subTypes || []}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </>
  );
};

export default memo(DishesList);
