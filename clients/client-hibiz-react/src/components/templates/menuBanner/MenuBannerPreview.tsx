import { memo } from "react";

import BottomSelections from "./bottomselections";
import EmblaCarousel from "../embla/emblaCarousel";
import type { EmblaOptionsType } from "embla-carousel";

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

const MemoMenuBannerPreview = () => {
  return (
    <section className="flex flex-col items-center justify-center w-full gap-6 px-4 lg:flex-row lg:justify-evenly lg:items-start">
      <section className="flex flex-col items-center w-full max-w-[30rem] pt-8 overflow-hidden pb-6 mt-4 bg-[#f2544440] relative">
        <h1 className="absolute text-4xl text-center text-black -translate-x-1/2 top-2 bungee-inline left-1/2">
          <span className="opacity-50">sankalesh</span> harak
        </h1>
        <div className="absolute w-full bg-[#f2544470] rounded-full -top-[35%] h-2/3" />
        <EmblaCarousel options={OPTIONS} />
      </section>
      <BottomSelections />
    </section>
  );
};

const MenuBannerPreview = memo(MemoMenuBannerPreview);
export default MenuBannerPreview;
