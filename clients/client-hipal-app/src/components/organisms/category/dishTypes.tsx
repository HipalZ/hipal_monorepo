import MainTypes from "@/components/molecules/categoryTypes/mainTypes";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo } from "react";

const MemoDishesTypes = ({
  parentCategory,
  childCategory,
}: {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}) => {
  return (
    <section className="sticky z-50 text-primary top-[3.125rem]">
      <MainTypes
        parentCategory={parentCategory}
        childCategory={childCategory}
      />
    </section>
  );
};

const DishesTypes = memo(MemoDishesTypes);
export default DishesTypes;
