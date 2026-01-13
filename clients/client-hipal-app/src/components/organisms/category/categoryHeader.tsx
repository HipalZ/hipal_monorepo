"use client";
import Header from "@/components/molecules/header";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo } from "react";

interface ICategoryProps {
  childCategory: CategoryType[];
}

function CategoryHeader(props: ICategoryProps) {
  const { childCategory } = props;

  return (
    <div className="sticky top-0 z-50 bg-white">
      <Header categories={childCategory} />
    </div>
  );
}

const MemoCategoryHeader = memo(CategoryHeader);
export default MemoCategoryHeader;
