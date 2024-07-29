import { useActiveClass } from "@/components/store/useActiveClass";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { SplideSlide } from "@splidejs/react-splide";
import {
  type CSSProperties,
  memo,
  type ReactNode,
  useEffect,
  useMemo,
} from "react";

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
    setActiveParentCategory,
    setActiveParentCategoryName,
    setActiveCategory
  } = useActiveClass();

  const SplideSlideWrapper = ({ children }: { children?: ReactNode }) => {
    return <SplideSlide>{children}</SplideSlide>;
  };
  const containerStyles: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    padding: "0",
    gap: "0rem",
  };

  const setMainCategory = (category: CategoryType) => {
    setActiveParentCategory(category._id?.toString() ?? "");
    setActiveParentCategoryName(category.name ?? "");
    setActiveCategory(category.subCategoryIds[0]?.toString() ?? "");
  };

  useEffect(() => {
    if (!isActiveParentCategory) {
      setActiveParentCategory(mainTypes[0]._id?.toString() ?? "");
    }
  }, [isActiveParentCategory, mainTypes, setActiveParentCategory]);

  return mainTypes.length > 0 ? (
    <div className="flex w-full px-4 mx-auto hide-scrollbar bg-base-300 no-scrollbar">
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
