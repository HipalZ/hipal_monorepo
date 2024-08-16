import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import SelectingCardLayout from "./selectingCardLayout";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";

const MemoBannerLayout5 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
  }));
  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));
  return (
    <section
      onKeyDown={() => {
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern);
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      onClick={() => {
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern);
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      key={layout?._id}
    >
      <article className="relative flex justify-center shrink-0 max-w-[12rem]">
        <figure className="w-full max-w-[12rem] rounded-2xl">
          <img
            src={layout?.image}
            alt={layout?.title}
            className="rounded-xl w-[12rem] h-[11rem] bg-cover"
          />
        </figure>
        <article
          style={{
            background:
              "linear-gradient(to bottom, transparent 10% , black 50%, transparent 80%)",
          }}
          className="absolute top-0 flex flex-col items-start justify-center w-full p-2 bg-black rounded-xl"
        >
          <h1 className="text-[0.7rem] truncate text-white">
            {layout?.heading}
          </h1>
          <p
            style={{
              WebkitLineClamp: 2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            className="text-[0.5rem] text-white bg-opacity-50"
          >
            {layout?.paragraph}
          </p>
          {layout?.isButton && (
            <div className="flex items-center border border-1 px-1 py-0.5 text-[0.5rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
              <button type="button">{layout?.buttonText}</button>{" "}
              <span className="text-[0.6rem]">
                <LuArrowUpRight />
              </span>
            </div>
          )}
        </article>
      </article>
      <SelectingCardLayout layout={layout} />
    </section>
  );
};

const BannerLayout5 = memo(MemoBannerLayout5);
export default BannerLayout5;
