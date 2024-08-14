import { useBannerStore } from "@/components/store/useBannerStore";
import type { BannerLayout } from "@/components/types/businessData";
import { memo } from "react";
import SelectingCardLayout from "./selectingCardLayout";

const MemoBannerLayout7 = ({ layout }: { layout: BannerLayout }) => {
  const { handleBannerType } = useBannerStore((s) => ({
    handleBannerType: s.handleBannerType,
  }));

  return (
    <section
      onKeyDown={() =>
        handleBannerType(
          layout?._id,
          layout?.isButton,
          layout?.isPattern,
          layout?.onlyImage,
        )
      }
      onClick={() =>
        handleBannerType(
          layout?._id,
          layout?.isButton,
          layout?.isPattern,
          layout?.onlyImage,
        )
      }
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
