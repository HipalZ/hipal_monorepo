import PlaceholderImg from "@/components/atoms/placeholder";
import { useActiveClass } from "@/components/store/useActiveClass";
import { getRandomBlurImg } from "@/components/utils/images";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

interface ISubTypes {
  parentCategory: CategoryType[];
  childCategory: CategoryType[];
  primaryColor?: string;
  secondaryColor?: string;
  isClassicLayout?: boolean;
}

const filterDishesByType = (
  category: CategoryType,
  activeDishType: string,
): boolean => {
  return (
    category.hierarchy === "CHILD" &&
    category.dishIds &&
    category.dishIds.length > 0 &&
    category.dishIds.some((dish: DishType) => {
      const typeMap: Record<string, string[]> = {
        all: [], // Show all dishes
        nonveg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        non_veg: ["NON_VEG", "ALCOHOL", "NON_ALCOHOL"],
        veg: ["VEG", "ALCOHOL", "NON_ALCOHOL"],
        vegan: ["VEGAN", "ALCOHOL", "NON_ALCOHOL"],
        alcoholic: ["ALCOHOL"],
        nonalcoholic: ["NON_ALCOHOL"],
      };

      const allowedTypes = typeMap[activeDishType.toLowerCase()] || [];

      return (
        !dish.isDeleted &&
        dish.visibility &&
        (activeDishType.toLowerCase() === "all" ||
          dish.dishTypes?.some((type) => allowedTypes.includes(type)))
      );
    })
  );
};

const MemoSubTypes = (props: ISubTypes) => {
  const {
    childCategory,
    parentCategory,
    primaryColor = "#000000",
    secondaryColor = "#f5f5f5",
    isClassicLayout = true
  } = props;
  const {
    isActiveCategory,
    isActiveDishType,
    setActiveCategory,
    setActiveParentCategory,
    setActiveChildCategory,
    setObserverActive,
  } = useActiveClass();

  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);

  const subTypes = useMemo(() => {
    return childCategory?.filter((category) =>
      filterDishesByType(category, isActiveDishType),
    );
  }, [childCategory, isActiveDishType]);

  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category.parentCategoryIds[0]?.toString() || "");
      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      const element = document.getElementById(category._id?.toString() || "");
      if (element) {
        element.style.scrollMarginTop = "200px";
        element.scrollIntoView({ behavior: "smooth" });
      }

      setTimeout(() => {
        setObserverActive(true);
      }, 3000);
    },
    [
      setActiveCategory,
      setActiveParentCategory,
      setActiveChildCategory,
      setObserverActive,
    ],
  );

  const splideRef = useRef<Splide>(null);

  useEffect(() => {
    if (isActiveCategory && splideRef.current) {
      const slideIndex = subTypes.findIndex(
        (item) => item._id?.toString() === isActiveCategory,
      );
      if (slideIndex !== -1) {
        splideRef.current.go(slideIndex);
      }
    }
  }, [isActiveCategory, subTypes]);

  return (
    <>
      {outletInfo?.outLetType !== "OTHER" ? (
        <section className="overflow-x-auto no-scrollbar -mt-4 bg-[#ffffff]" style={{ color: primaryColor }}>
          {subTypes.length > 0 && (
            <Splide
              ref={splideRef}
              options={{
                type: "slide",
                pagination: false,
                drag: "free",
                snap: true,
                arrows: false,
                autoWidth: true,
              }}
              className="w-full no-scrollbar"
            >
              {subTypes.map((item: CategoryType, index: number) => (
                <SplideSlide key={item._id?.toString()}>
                  <button
                    type="button"
                    id={item._id?.toString() + index.toString()}
                    className="relative flex flex-col items-center px-2 py-3 snap-center"
                    onClick={() => setActiveCategories(item)}
                  >
                    <article
                      className={cn(
                        isActiveCategory === item._id?.toString()
                          ? "underline underline-offset-[0.75rem] font-semibold"
                          : "",
                        "flex flex-col items-center justify-center transition-all duration-200 ease-in-out",
                      )}
                    >
                      {item?.coverImage ? (
                        <figure className="flex-shrink-0 h-[3.25rem] mb-1 overflow-hidden rounded-md w-[3.25rem] aspect-square">
                          <Image
                            src={item.coverImage || ""}
                            alt="dish"
                            quality={95}
                            width={52}
                            height={52}
                            blurDataURL={getRandomBlurImg(50, 50)}
                            className="object-cover rounded-md aspect-square"
                          />
                        </figure>
                      ) : (
                        <figure
                          className="flex-shrink-0 w-[3.25rem] h-[3.25rem] mb-1 overflow-hidden rounded-full aspect-square"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          <PlaceholderImg className="rounded-full" />
                        </figure>
                      )}
                      <h6 className="w-full text-sm text-center">
                        {item.name}
                      </h6>
                    </article>
                  </button>
                </SplideSlide>
              ))}
            </Splide>
          )}
        </section>
      ) : (
        <section
          className={`overflow-x-auto border-b pt-3 -mt-2 no-scrollbar bg-[#ffffff]`}
          style={{
            color: primaryColor,
            borderBottomColor: primaryColor
          }}
        >
          {subTypes.length > 0 && parentCategory?.length > 0 && (
            <Splide
              ref={splideRef}
              options={{
                type: "slide",
                pagination: false,
                drag: "free",
                snap: true,
                arrows: false,
                autoWidth: true,
              }}
              className="w-full no-scrollbar"
            >
              {subTypes.map((item: CategoryType, index: number) => (
                <SplideSlide key={item._id?.toString()}>
                  <button
                    type="button"
                    id={item._id?.toString() + index.toString()}
                    className="relative flex flex-col items-center px-2 py-3 snap-center"
                    onClick={() => setActiveCategories(item)}
                  >
                    <article
                      className={cn(
                        isActiveCategory === item._id?.toString()
                          ? "underline underline-offset-[0.75rem] font-semibold"
                          : "",
                        "flex flex-col items-center justify-center transition-all duration-200 ease-in-out",
                      )}
                    >
                      {item?.coverImage ? (
                        <figure className="flex-shrink-0 h-[3.25rem] mb-1 overflow-hidden rounded-md w-[3.25rem] aspect-square">
                          <Image
                            src={item.coverImage || ""}
                            alt="dish"
                            quality={95}
                            width={52}
                            height={52}
                            blurDataURL={getRandomBlurImg(50, 50)}
                            className="object-cover rounded-md aspect-square"
                          />
                        </figure>
                      ) : (
                        <figure
                          className="flex-shrink-0 w-[3.25rem] h-[3.25rem] mb-1 overflow-hidden rounded-full aspect-square"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          <PlaceholderImg className="rounded-full" />
                        </figure>
                      )}
                      <h6 className="w-full text-sm text-center">
                        {item.name}
                      </h6>
                    </article>
                  </button>
                </SplideSlide>
              ))}
            </Splide>
          )}
        </section>
      )}
    </>
  );
};

const SubTypes = memo(MemoSubTypes);
export default SubTypes;
