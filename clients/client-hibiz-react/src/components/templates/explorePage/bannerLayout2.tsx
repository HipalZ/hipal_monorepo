import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import SelectingCardLayout from "./selectingCardLayout";

const MemoBannerLayout2 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
  }));

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
      <article className="relative flex justify-start shrink-0">
        <figure className="w-full max-w-[12rem] rounded-2xl">
          <img
            src={layout?.image}
            alt={layout?.title}
            className="rounded-xl w-[12rem] h-[11rem] bg-cover"
          />
        </figure>
        <article className="absolute bottom-2 bg-white w-100% max-w-[11rem] mx-2 p-2 rounded-xl h-[3.5rem]">
          <div className="flex justify-between">
            <h1 className="text-[0.7rem] truncate">{layout?.heading}</h1>
            {layout?.isButton && (
              <div className="flex items-center bg-red-700 px-1 py-0.5 text-[0.6rem] text-white rounded-full space-x-0.5 scale-75 -mr-1">
                <button type="button">{layout?.buttonText}</button>{" "}
                <span className="text-[0.6rem]">
                  <LuArrowUpRight />
                </span>
              </div>
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
    </section>
  );
};

const BannerLayout2 = memo(MemoBannerLayout2);
export default BannerLayout2;
