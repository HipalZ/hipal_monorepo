import MainTypes from "@/components/molecules/categoryTypes/mainTypes";
import SubTypes from "@/components/molecules/categoryTypes/subTypes";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo } from "react";

function DishesTypes({
  showHeader,
  parentCategory,
  childCategory,
}: {
  showHeader: boolean;
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}) {
  return (
    <section
      className={`text-primary sticky z-50 ${
        showHeader ? "top-[3.125rem]" : "top-0"
      }`}
    >
      <MainTypes parentCategory={parentCategory} />
      <SubTypes childCategory={childCategory} />
    </section>
  );
}

const MemoDishesTypes = memo(DishesTypes);
export default MemoDishesTypes;
