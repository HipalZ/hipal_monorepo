"use client";
import Header from "@/components/molecules/header";
import DishesTypes from "@/components/organisms/category/dishTypes";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface ICategoryProps {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
}
function CategoryHeader(props: ICategoryProps) {
  const { parentCategory, childCategory } = props;
  console.log("parentCategory", parentCategory, childCategory);
  const businessData = useBusinessDetails((s) => s.businessDetails);
  const router = useRouter();
  const [data, setData] = useState({
    roundedHeader: false,
  }); // roundedHeader is false when the header is scrolled to the top
  const { entry } = useInView({
    threshold: 1,
  });


  useEffect(() => {
    changeHeaderStyle();
  }, [entry]);

  const goBack = () => {
    router.push(`/${businessData.customLink}/explore`);
  };

  return (
    <>
      <Header
        hideBackBtn={data.roundedHeader}
        // categories={categories}
        backURL={goBack}
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
