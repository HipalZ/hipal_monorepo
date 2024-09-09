"use client";
import Header from "@/components/molecules/header";
import DishesTypes from "@/components/organisms/category/dishTypes";
import { useSearch } from "@/components/store/useSearch";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useEffect, useRef, useState } from "react";

interface ICategoryProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}

function CategoryHeader(props: ICategoryProps) {
  const { parentCategory, childCategory } = props;
  const { isSearchActive, showHeader, setShowHeader } = useSearch();
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerRef = useRef(null);
  const handleScroll = () => {
    const currentScrollY = document.body.scrollTop;

    if (isSearchActive) {
      setShowHeader(true);
      return;
    }

    if (
      currentScrollY > lastScrollY &&
      Math.abs(currentScrollY - lastScrollY) > 50
    ) {
      setShowHeader(false);
    } else if (currentScrollY < lastScrollY) {
      setShowHeader(true);
    }

    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    const resetScrollPosition = () => {
      setLastScrollY(document.body.scrollTop);
    };

    if (isSearchActive) {
      resetScrollPosition();
    }

    document.body.addEventListener("scroll", handleScroll);
    return () => document.body.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isSearchActive]);

  return (
    <>
      <div
        ref={headerRef}
        className={`${
          showHeader ? "sticky top-0 z-50 opacity-100" : "opacity-0"
        } transition-all duration-300 ease-in-out`}
      >
        <Header categories={childCategory} />
      </div>
      {!isSearchActive && (
        <DishesTypes
          showHeader={showHeader}
          parentCategory={parentCategory}
          childCategory={childCategory}
        />
      )}
    </>
  );
}

const MemoCategoryHeader = memo(CategoryHeader);
export default MemoCategoryHeader;
