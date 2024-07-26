import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import SelectingCardLayout from "./selectingCardLayout";

const MemoBannerLayout1 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
    selectedBannerType: s.selectedBannerType,
  }));

  return (
    <div
      onKeyDown={() =>
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern)
      }
      onClick={() =>
        handleBannerType(layout?._id, layout?.isButton, layout?.isPattern)
      }
      className="relative flex flex-col"
      key={layout?._id}
    >
      <article className="max-h-[11.5rem]">
        <figure className="w-full max-w-[12rem] rounded-2xl">
          <img
            src={layout?.image}
            alt={layout?.title}
            className="rounded-t-xl w-[12rem] h-[8.5rem]"
          />
        </figure>
        <article className="bg-white w-full max-w-[12rem] p-2 rounded-b-xl h-[3.5rem]">
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
    </div>
  );
};

const BannerLayout1 = memo(MemoBannerLayout1);
export default BannerLayout1;
