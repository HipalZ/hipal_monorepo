"use client";
import Header from "@/components/molecules/header";
import DishesTypes from "@/components/organisms/category/dishTypes";
import { useSearch } from "@/components/store/useSearch";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo } from "react";

interface ICategoryProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}
function CategoryHeader(props: ICategoryProps) {
  const { parentCategory, childCategory } = props;

  const {isSearchActive,setIsSearchActive} = useSearch();

  return (
    <>
      <Header
      categories={childCategory}
      />

      {
        !isSearchActive && (
          <DishesTypes
            parentCategory={parentCategory}
            childCategory={childCategory}
          />
        )
      }
        
    </>
  );

  
}

const MemoCategoryHeader = memo(CategoryHeader);
export default MemoCategoryHeader;
