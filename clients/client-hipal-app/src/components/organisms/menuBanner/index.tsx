"use client";
import type { TimingType } from "@/components/types/businessData";
import { type FC, memo } from "react";
import EmblaCarouselPreview from "../category/embla/emblaCarousalPreview";
import type { EmblaOptionsType } from "embla-carousel";
import { useSearch } from "@/components/store/useSearch";

interface IDishesProps {
  timings: TimingType;
}
const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };
const MemoMenuBannerPage: FC<IDishesProps> = (props) => {
  const { timings } = props;

  const { isSearchActive } = useSearch();

  if (isSearchActive) return null;
  return (
    <div>
      {" "}
      {Object.keys(timings)?.length > 0 && timings?.dishIds?.length > 0 && (
        <section className="relative flex items-center justify-center w-full bg-[#ffffff]">
          <section className="flex flex-col items-center justify-center w-full max-w-[30rem] pt-[1.5rem] overflow-hidden pb-[2rem] md:pb-[2rem] bg-[#ffffff] relative">
            <h1 className="relative z-10 text-[1.75rem] text-[#000000] bungee-inline">
              <span className="opacity-80 text-[#000000]">
                {timings?.heading || "Specials"}
              </span>
            </h1>
            <div className="absolute -top-[6rem] w-[110%] h-[15rem] rounded-full bg-[#febb86]" />
            <EmblaCarouselPreview timings={timings} options={OPTIONS} />
          </section>
        </section>
      )}
    </div>
  );
};

const MenuBannerPage = memo(MemoMenuBannerPage);
export default MenuBannerPage;
