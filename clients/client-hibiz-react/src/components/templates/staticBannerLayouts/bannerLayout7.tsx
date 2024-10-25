import { useBannerStore } from "@/components/store/useBannerStore";
import { lazy, memo } from "react";
import {
  ExplorePages,
  useExploreStore,
} from "@/components/store/useExploreStore";
import pastaDummy from "@/assets/pastaDummy.png";
const SelectingCardLayout = lazy(
  () => import("../explorePage/selectingCardLayout"),
);

const MemoBannerLayout7 = ({ layout }: { layout }) => {
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
        src={pastaDummy}
        alt={layout?.title}
        className="bg-cover rounded-2xl w-full max-w-[11.5rem] h-[11.5rem] aspect-square shadow-lg"
      />
      <SelectingCardLayout layout={layout} />
    </section>
  );
};

const BannerLayout7 = memo(MemoBannerLayout7);
export default BannerLayout7;
