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
  childCategory: CategoryType[];
}

function MainTypes(props: IMainTypes) {
  const { parentCategory, childCategory } = props;

  const mainTypes = useMemo(
    () =>
      parentCategory?.filter((category) => category.subCategoryIds.length > 0),
    [parentCategory],
  );

  const subTypes = useMemo(
    () => childCategory?.filter((category) => category.dishIds.length > 0),
    [childCategory],
  );

  const {
    isActiveParentCategory,
    isActiveCategory,
    isActiveChildCategory,
    setActiveParentCategory,
    setActiveParentCategoryName,
    setActiveCategory,
    setActiveChildCategory,
    setActiveChildCategoryName,
    setObserverActive,
  } = useActiveClass((s) => ({
    isActiveParentCategory: s.isActiveParentCategory,
    isActiveCategory: s.isActiveCategory,
    setActiveParentCategory: s.setActiveParentCategory,
    setActiveParentCategoryName: s.setActiveParentCategoryName,
    setActiveCategory: s.setActiveCategory,
    isActiveChildCategory: s.isActiveChildCategory,
    setActiveChildCategory: s.setActiveChildCategory,
    setActiveChildCategoryName: s.setActiveChildCategoryName,
    setObserverActive: s.setObserverActive,
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
      setObserverActive(false);
      setActiveParentCategory(category._id?.toString() ?? "");
      setActiveParentCategoryName(category.name ?? "");
      setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
    },
    [
      setActiveParentCategory,
      setActiveParentCategoryName,
      setActiveCategory,
      setObserverActive,
    ],
  );

  useEffect(() => {
    const hashUrl = window.location.hash;
    const hashValue = hashUrl.substring(1);
    if (hashValue) {
      setActiveCategory(hashValue);
      const subCategory = subTypes?.find((category) =>
        category.dishIds?.some((dish) => dish._id === hashValue),
      );
      if (subCategory) {
        setActiveChildCategory(subCategory._id?.toString() ?? "");
        setActiveChildCategoryName(subCategory.name ?? "");
        const parentCategoryId =
          subCategory.parentCategoryIds[0]?.toString() ?? "";
        const parentCategoryName = mainTypes.find(
          (category) => category._id?.toString() === parentCategoryId,
        )?.name;

        setActiveParentCategory(parentCategoryId);
        setActiveParentCategoryName(parentCategoryName ?? "");
      } else {
        setActiveChildCategory(hashValue);
      }
    } else {
      const parentCategory = mainTypes.find((category) =>
        category.subCategoryIds.includes(isActiveCategory),
      );
      if (parentCategory) {
        setActiveParentCategory(parentCategory._id?.toString() ?? "");
        setActiveParentCategoryName(parentCategory.name ?? "");
        setActiveChildCategory(
          parentCategory.subCategoryIds[0]?.toString() ?? "",
        );
      }
    }
  }, [isActiveCategory, mainTypes, subTypes, isActiveChildCategory]);

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
