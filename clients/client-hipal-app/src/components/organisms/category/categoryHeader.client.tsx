"use client";
import Header from "@/components/molecules/header";
import DishesTypes from "@/components/organisms/category/dishTypes";
import { useRoutingFlow } from "@/components/store/useRoutingFlow";
import type { CategoryType } from "@hi/db-models/src/validators";
import { memo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface ICategoryProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}
function CategoryHeader(props: ICategoryProps) {
  const { parentCategory, childCategory } = props;
  const [data, setData] = useState({
    roundedHeader: false,
  }); // roundedHeader is false when the header is scrolled to the top
  const { entry } = useInView({
    threshold: 1,
  });

  const { getPreviousPath } = useRoutingFlow();

  useEffect(() => {
    changeHeaderStyle();
  }, [entry]);

  return (
    <>
      <Header
        hideBackBtn={data.roundedHeader}
        // categories={categories}
        backURL={`${getPreviousPath()}`}
        title={<div className="text-xl">Menu</div>}
        showOtherButtons
      />
      <DishesTypes
        parentCategory={parentCategory}
        childCategory={childCategory}
      />
    </>
  );

  function changeHeaderStyle() {
    if ((entry?.boundingClientRect.top as number) < 1) {
      setData({ ...data, roundedHeader: false });
    } else if (!data.roundedHeader) setData({ ...data, roundedHeader: true });
  }
}

const MemoCategoryHeader = memo(CategoryHeader);
export default MemoCategoryHeader;
