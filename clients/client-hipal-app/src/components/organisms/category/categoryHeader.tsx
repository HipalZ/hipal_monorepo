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
  const { isSearchActive } = useSearch();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0); // State to track the last scroll position
  const headerRef = useRef(null);

  // Function to handle scroll and determine if the user is scrolling up or down
  const handleScroll = () => {
    // Get the current scroll position using document.documentElement.scrollTop
    const currentScrollY =
      document.documentElement.scrollTop || document.body.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      setShowHeader(false);
    } else if (currentScrollY < lastScrollY) {
      setShowHeader(true);
    }

    setLastScrollY(currentScrollY); // Update the last scroll position
  };

  useEffect(() => {
    document.body.addEventListener("scroll", handleScroll);

    return () => document.body.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div
        ref={headerRef}
        className={`${
          showHeader ? "sticky top-0 z-50 opacity-100" : "opacity-0"
        } transition-all duration-300 ease-in-out`}
      >
        <Header categories={childCategory} showHeader={showHeader} />
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
