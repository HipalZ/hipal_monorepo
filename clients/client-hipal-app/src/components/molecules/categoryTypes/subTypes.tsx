import PlaceholderImg from "@/components/atoms/placeholder";
import { useActiveClass } from "@/components/store/useActiveClass";
import { getRandomBlurImg } from "@/components/utils/images";
import { cn } from "@hi/common";
import type { CategoryType, DishType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";

interface ISubTypes {
  childCategory: CategoryType[];
}

const MemoSubTypes = (props: ISubTypes) => {
  const { childCategory } = props;
  const {
    isActiveCategory,
    isActiveDishType,
    setActiveCategory,
    setActiveParentCategory,
    setActiveChildCategory,
    setObserverActive,
  } = useActiveClass();

  const subTypes = useMemo(() => {
    const hasVisibleDishesOfType = (category: CategoryType): boolean => {
      return (
        category.hierarchy === "CHILD" &&
        category.dishIds &&
        category.dishIds.length > 0 &&
        category.dishIds.some((dish: DishType) => {
          return (
            !dish.isDeleted &&
            dish.visibility &&
            (isActiveDishType.toLowerCase() === "all" ||
              dish.dishTypes?.includes(isActiveDishType))
          );
        })
      );
    };

    return childCategory.filter(hasVisibleDishesOfType);
  }, [childCategory, isActiveDishType]);

  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      setObserverActive(false);
      setActiveParentCategory(category.parentCategoryIds[0]?.toString() || "");
      setActiveCategory(category._id?.toString() || "");
      setActiveChildCategory(category._id?.toString() || "");

      const element = document.getElementById(category._id?.toString() || "");
      if (element) {
        element.style.scrollMarginTop = "110px";
        element.scrollIntoView({ behavior: "smooth" });
      }

      setTimeout(() => {
        setObserverActive(true);
      }, 1000);
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
    <section className="overflow-x-auto border-b shadow-lg border-b-primary no-scrollbar bg-base-100 text-primary">
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
                className="relative h-[4rem] px-2 py-3 snap-center"
                onClick={() => setActiveCategories(item)}
              >
                <article
                  className={cn(
                    isActiveCategory === item._id?.toString()
                      ? "bg-primary text-base-100"
                      : "text-primary",
                    "flex border border-primary rounded-full items-center justify-center pl-1 pr-2 !py-1 transition-all duration-200 ease-in-out",
                    "h-[2rem]",
                  )}
                >
                  {item?.coverImage ? (
                    <figure className="flex-shrink-0 w-6 h-6 mr-2 overflow-hidden rounded-full aspect-square">
                      <Image
                        src={item.coverImage || ""}
                        alt="dish"
                        quality={95}
                        width={35}
                        height={35}
                        blurDataURL={getRandomBlurImg(50, 50)}
                        className="object-cover rounded-full aspect-square"
                      />
                    </figure>
                  ) : (
                    <figure className="flex-shrink-0 w-6 h-6 overflow-hidden rounded-full aspect-square">
                      <PlaceholderImg className="mr-2 rounded-full" />
                    </figure>
                  )}
                  <h6 className="w-full text-sm text-center">{item.name}</h6>
                </article>
              </button>
            </SplideSlide>
          ))}
        </Splide>
      )}
    </section>
  );
};

const SubTypes = memo(MemoSubTypes);
export default SubTypes;
