import PlusButton from "@/components/atom/plusButton";
import { useImageChange } from "@/components/helpers/explorePageHelpers";
import { useExploreStore } from "@/components/store/useExploreStore";
import { cn, handleClick } from "@/components/utils/helper";
import { lazy, memo, useRef } from "react";
import { CiEdit } from "react-icons/ci";

const SubHeader = lazy(() => import("@/components/atom/subHeader"));
const MemoCategoryTopBanner = () => {
  const { img } = useExploreStore((s) => ({
    img: s.img,
  }));
  const categoryTopInputRef = useRef<HTMLInputElement | null>(null);
  const { handleImageChange } = useImageChange();

  return (
    <>
      <section className="flex-1 my-4">
        <SubHeader text="Category Banner" />
        <article
          className={cn(
            "relative rounded-xl max-w-[23.5rem] h-[8.4rem]",
            img?.categoryTopBanner?.length > 0
              ? ""
              : "border-dashed border-2 border-[#8C63FF]",
          )}
        >
          <input
            ref={categoryTopInputRef}
            onClick={(e) => handleClick(e, categoryTopInputRef)}
            type="file"
            id="categoryTopBanner"
            style={{ display: "none" }}
            onChange={handleImageChange}
            data-type="categoryTopBanner"
            accept="*"
          />
          <figure className="w-full max-w-[28rem] h-[10px] mx-auto lg:mx-0 ">
            <label
              htmlFor="categoryTopBanner"
              className="flex items-center justify-center overflow-hidden cursor-pointer rounded-xl"
            >
              <figure className="w-full max-w-[28rem] h-[110px]">
                {img.categoryTopBanner ? (
                  <div className="relative w-full max-w-[28rem] h-[110px]">
                    <figure className="w-full h-full">
                      <img
                        src={img.categoryTopBanner}
                        alt="categoryTopBanner"
                        className="object-cover w-full h-full rounded-2xl"
                      />
                    </figure>
                    <CiEdit className="absolute top-0 right-0 w-8 h-8 p-1 text-black bg-white rounded-full cursor-pointer" />
                  </div>
                ) : (
                  <PlusButton />
                )}
              </figure>
            </label>
          </figure>
        </article>
      </section>
    </>
  );
};

const CategoryTopBanner = memo(MemoCategoryTopBanner);
export default CategoryTopBanner;
