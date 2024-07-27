"use client";
import Header from "@/components/molecules/header";
import DishesTypes from "@/components/organisms/category/dishTypes";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo } from "react";
import { useInView } from "react-intersection-observer";

interface ICategoryProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}
function CategoryHeader(props: ICategoryProps) {
  const { parentCategory, childCategory } = props;
  return (
    <>
      <Header
      // categories={categories}
      />
      <DishesTypes
        parentCategory={parentCategory}
        childCategory={childCategory}
      />
    </>
  );

  
}

const MemoCategoryHeader = memo(CategoryHeader);
export default MemoCategoryHeader;
