import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import SelectingCardLayout from "./selectingCardLayout";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";

const MemoBannerLayout7 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
  }));

  const { setToggleExplorePages } = useExploreStore((s) => ({
    setToggleExplorePages: s.setToggleExplorePages,
  }));

  return (
    <section
      onKeyDown={() => {
        handleBannerType(
          layout?._id,
          layout?.isButton,
          layout?.isPattern,
          layout?.onlyImage,
        );
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      onClick={() => {
        handleBannerType(
          layout?._id,
          layout?.isButton,
          layout?.isPattern,
          layout?.onlyImage,
        );
        setToggleExplorePages(ExplorePages.NEWBANNER);
      }}
      key={layout?._id}
    >
      <img
        src={layout?.image}
        alt={layout?.title}
        className="bg-cover rounded-2xl w-full max-w-[11.5rem] h-[11.5rem] aspect-square"
      />
      <SelectingCardLayout layout={layout} />
    </section>
  );
};

const BannerLayout7 = memo(MemoBannerLayout7);
export default BannerLayout7;
