import type { BannerLayout } from "@/components/types/businessData";
import { BannerType } from "@/components/utils/bannerLayouts";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import SelectingCardLayout from "./selectingCardLayout";
import { useBannerStore } from "@/components/store/useBannerStore";

const MemoBannerLayouts6 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
  }));

  const color =
    layout?._id === BannerType.BANNER_TYPE_12 ? "#678BFF" : "#E03030";
  const patternColor = "#00000050";

  return (
    <section
      onKeyDown={() =>
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern)
      }
      onClick={() =>
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern)
      }
      key={layout?._id}
    >
      <article
        className="relative h-[11.5rem] max-w-[12rem] rounded-xl"
        style={{ backgroundColor: color }}
      >
        <figure className="absolute top-2 left-2">
          {layout?.isPattern && <layout.pattern color={patternColor} />}
        </figure>
        <figure className="absolute -rotate-180 bottom-2 right-2">
          {layout?.isPattern && <layout.pattern color={patternColor} />}
        </figure>
        <article className="absolute flex flex-col items-center justify-center w-full p-2 translate-y-1/2 bottom-1/2 rounded-xl">
          <h1 className="text-[0.7rem] truncate text-white">
            {layout?.heading}
          </h1>
          <p
            style={{
              WebkitLineClamp: BannerType.BANNER_TYPE_13 ? 3 : 2,
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

const BannerLayouts6 = memo(MemoBannerLayouts6);
export default BannerLayouts6;
