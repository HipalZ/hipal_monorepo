import PlaceholderImg from "@/components/atoms/placeholder";
import { useActiveClass } from "@/components/store/useActiveClass";
import { getRandomBlurImg } from "@/components/utils/images";
import { cn } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo } from "react";

interface ISubTypes {
  childCategory: CategoryType[];
}
function SubTypes(props: ISubTypes) {
  const { childCategory } = props;

  const {
    isActiveCategory,
    setActiveCategory,
    isActiveParentCategory,
    setActiveParentCategory,
  } = useActiveClass();

  const subTypes = useMemo(() => 
    childCategory.filter(category => 
      category.hierarchy === "CHILD" &&
      category.parentCategoryIds.includes(isActiveParentCategory) &&
      category.dishIds.length > 0 
    ), [childCategory, isActiveParentCategory]);

  const setActiveCategories = useCallback((category: CategoryType) => {
    setActiveCategory(category._id?.toString() ?? "");
  }, []);

  useEffect(() => {
    if (subTypes.length > 0) {
      setActiveCategory(subTypes[0]._id?.toString() ?? "");
    }
  }, [isActiveParentCategory, subTypes]);

  return (
    <section className="overflow-x-auto no-scrollbar bg-base-100">
      {subTypes?.length > 0 && (
        <div className="flex flex-nowrap -webkit-flex snap-proximity snap-x no-scrollbar">
          {subTypes.map((item: CategoryType, index: number) => (
            <button
              type="button"
              id={item?._id?.toString() + index.toString()}
              className="relative px-2 py-4 snap-center"
              key={item.name}
              onClick={() => setActiveCategories(item)}
            >
              <a href={`#${item?._id}`}>
                <article
                  className={cn( isActiveCategory === item._id?.toString() ? "bg-primary text-white" :"",
                    "flex w-full border border-primary rounded-full items-center justify-between px-2 py-1"
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
                        objectFit="cover"
                        blurDataURL={getRandomBlurImg(50, 50)}
                      />
                    </figure>
                  ) : (
                    <figure className="w-[2rem] h-[1.5rem] rounded-full overflow-hidden">
                      <PlaceholderImg className="rounded-full" />
                    </figure>
                  )}
                  <h6
                    className={" text-sm w-full whitespace-nowrap text-nowrap"}
                  >
                    {item?.name}
                  </h6>
                </article>
              </a>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const MemoSubTypes = memo(SubTypes);
export default MemoSubTypes;
