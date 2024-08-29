import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import {
  type CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import SplideSlideWrapper from "./spliderSlide";

interface IMainTypes {
  parentCategory: CategoryType[];
}

function MainTypes(props: IMainTypes) {
  const { parentCategory } = props;

  const mainTypes = useMemo(
    () =>
      parentCategory.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );

  const {
    isActiveParentCategory,
    isActiveCategory,
    setActiveParentCategory,
    setActiveParentCategoryName,
    setActiveCategory,
  } = useActiveClass((s) => ({
    isActiveParentCategory: s.isActiveParentCategory,
    isActiveCategory: s.isActiveCategory,
    setActiveParentCategory: s.setActiveParentCategory,
    setActiveParentCategoryName: s.setActiveParentCategoryName,
    setActiveCategory: s.setActiveCategory,
  }));

  const containerStyles: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    padding: "0",
    gap: "0rem",
  };

  const setMainCategory = useCallback(
    (category: CategoryType) => {
      setActiveParentCategory(category._id?.toString() ?? "");
      setActiveParentCategoryName(category.name ?? "");
      setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
    },
    [setActiveParentCategory, setActiveParentCategoryName, setActiveCategory],
  );

  useEffect(() => {
    const hashUrl = window.location.hash;
    if (hashUrl) {
      const hashValue = hashUrl.substring(1);
      setActiveCategory(hashValue);
    } else {
      const firstCategory = mainTypes[0];
      setActiveParentCategory(firstCategory._id?.toString() ?? "");
      setActiveParentCategoryName(firstCategory.name ?? "");
      setActiveCategory(firstCategory.subCategoryIds[0]?.toString() ?? "");
    }
  }, [mainTypes]);

  useEffect(() => {
    console.log(isActiveCategory);
    if (isActiveCategory) {
      const parentCategory = mainTypes.find((category) =>
        category.subCategoryIds.includes(isActiveCategory),
      );
      if (parentCategory) {
        setActiveParentCategory(parentCategory._id?.toString() ?? "");
        setActiveParentCategoryName(parentCategory.name ?? "");
      }
    }
  }, [isActiveCategory, mainTypes]);

  return mainTypes.length > 0 ? (
    <div className="flex items-center w-full px-2 mx-auto hide-scrollbar bg-base-300 no-scrollbar">
      <div style={containerStyles} className="whitespace-nowrap no-scrollbar">
        {mainTypes
          .filter((item) => item?.visibility)
          .map((item: CategoryType, index: number) => {
            return (
              <section className={cn("flex items-center")} key={item?.name}>
                <SplideSlideWrapper>
                  <div id={item?._id?.toString()} className="relative py-1">
                    <button
                      type="button"
                      onClick={() => setMainCategory(item)}
                      className={cn(
                        isActiveParentCategory === item._id?.toString()
                          ? "border-primary border-b"
                          : "",
                        "on_active_bounce text-sm flex capitalize space-x-2 py-[0.65rem]",
                      )}
                    >
                      <span className="font-semibold min-w-max">
                        {item.name}
                      </span>
                    </button>
                  </div>
                </SplideSlideWrapper>
                {index <
                  mainTypes.filter((item) => item?.visibility).length - 1 && (
                  <div className="text-2xl !font-thin divider opacity-70">
                    |
                  </div>
                )}
              </section>
            );
          })}
      </div>
    </div>
  ) : null;
}

const MainTypesMemo = memo(MainTypes);
export default MainTypesMemo;
