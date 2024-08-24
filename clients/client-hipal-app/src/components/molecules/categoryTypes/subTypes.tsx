import PlaceholderImg from "@/components/atoms/placeholder";
import { useActiveClass } from "@/components/store/useActiveClass";
import { getRandomBlurImg } from "@/components/utils/images";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";

interface ISubTypes {
  childCategory: CategoryType[];
}

function SubTypes(props: ISubTypes) {
  const { childCategory } = props;
  const {
    isActiveCategory,
    setActiveCategory,
    setActiveParentCategory,
    isActiveParentCategory,
  } = useActiveClass();

  const subTypes = useMemo(
    () =>
      childCategory.filter(
        (category) =>
          category.hierarchy === "CHILD" &&
          category.dishIds.length > 0 &&
          category.parentCategoryIds[0]?.toString() === isActiveParentCategory,
      ),
    [childCategory, isActiveParentCategory],
  );

  const setActiveCategories = useCallback(
    (category: CategoryType) => {
      setActiveParentCategory(category?.parentCategoryIds?.[0].toString());
      setActiveCategory(category._id?.toString() ?? "");
    },
    [setActiveCategory, setActiveParentCategory],
  );

  const splideRef = useRef<Splide>(null);

  useEffect(() => {
    if (isActiveCategory && splideRef.current) {
      const slideIndex = subTypes.findIndex(
        (item) => item?._id.toString() === isActiveCategory,
      );
      if (slideIndex !== -1) {
        (splideRef.current as any).go(slideIndex);
      }
    }
  }, [isActiveCategory, subTypes]);

  return (
    <section className="overflow-x-auto border-b shadow-lg border-b-primary no-scrollbar bg-base-100 text-primary">
      {subTypes?.length > 0 && (
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
                id={item?._id?.toString() + index.toString()}
                className="relative px-2 py-3 snap-center"
                onClick={() => setActiveCategories(item)}
              >
                <article
                  className={cn(
                    isActiveCategory === item._id?.toString()
                      ? "bg-primary text-base-100 shadow-[inset_0_0_8px_rgba(0,0,0,0.2),_0_4px_6px_rgba(0,0,0,0.1)]"
                      : "text-primary shadow-[inset_0_0_4px_rgba(0,0,0,0.1),_0_2px_4px_rgba(0,0,0,0.1)]",
                    "flex border border-primary rounded-full items-center justify-between px-2 py-1 transition-all duration-200 ease-in-out",
                  )}
                >
                  {item.coverImage ? (
                    <figure className="w-[1.75rem] max-h-[1.5rem] mr-1 rounded-full overflow-hidden">
                      <Image
                        src={item.coverImage || ""}
                        alt="dish"
                        quality={95}
                        width={35}
                        height={35}
                        blurDataURL={getRandomBlurImg(50, 50)}
                        className="object-cover max-h-[1.5rem] max-w-[2rem]"
                      />
                    </figure>
                  ) : (
                    <figure className="w-[2rem] h-[1.5rem] rounded-full overflow-hidden">
                      <PlaceholderImg className="rounded-full" />
                    </figure>
                  )}
                  <h6 className="w-full text-sm">{item?.name}</h6>
                </article>
              </button>
            </SplideSlide>
          ))}
        </Splide>
      )}
    </section>
  );
}

const MemoSubTypes = memo(SubTypes);
export default MemoSubTypes;
