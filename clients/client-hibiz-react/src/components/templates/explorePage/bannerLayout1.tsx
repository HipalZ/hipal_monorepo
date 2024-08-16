import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import SelectingCardLayout from "./selectingCardLayout";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";

const MemoBannerLayout1 = ({ layout }: { layout: BannerLayout }) => {
  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
    selectedBannerType: s.selectedBannerType,
  }));

  return (
    <div
      onKeyDown={() => {
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern);
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      onClick={() => {
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern);
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      className="relative flex flex-col"
      key={layout?._id}
    >
      <article className="max-h-[11.5rem] max-w-[12rem] shadow-xl">
        <figure className="w-full max-w-[12rem] rounded-2xl">
          <img
            src={layout?.image}
            alt={layout?.title}
            className="rounded-t-xl w-[12rem] h-[8.5rem]"
          />
        </figure>
        <article className="bg-white w-full max-w-[12rem] p-2 rounded-b-xl h-[3.5rem] relative">
          <div className="flex justify-between">
            <h1 className="text-[0.7rem] font-semibold truncate">
              {layout?.heading}
            </h1>
            {layout?.isButton && (
              <article className="absolute right-2 flex items-center py-[0.1rem] px-1.5 text-[0.5rem] text-white bg-red-700 rounded-full">
                <button type="button">{layout?.buttonText}</button>{" "}
                <span className="text-[0.5rem]">
                  <LuArrowUpRight />
                </span>
              </article>
            )}
          </div>
          <p
            style={{
              WebkitLineClamp: 2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="text-[0.5rem]"
          >
            {layout?.paragraph}
          </p>
        </article>
      </article>
      <SelectingCardLayout layout={layout} />
    </div>
  );
};

const BannerLayout1 = memo(MemoBannerLayout1);
export default BannerLayout1;
