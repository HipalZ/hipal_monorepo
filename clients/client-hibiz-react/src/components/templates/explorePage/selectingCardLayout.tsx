import { useBannerStore } from "@/components/store/useBannerStore";
import { memo } from "react";

type Props = {
  layout: {
    _id: string;
    title: string;
    description: string;
    isButton: boolean;
    pattern?: string;
  };
  bannerLayout: string;
  handleBannerType: (
    id: string,
    isButton: boolean,
    patternType: string,
  ) => void;
};

const MemoSelectingCardLayout = (props: Props) => {
  const { layout, handleBannerType, bannerLayout } = props;
  const { selectedBannerType } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
  }));
  return (
    <section className="w-48">
      <article className="mt-4 mb-2">
        <input
          type="radio"
          className="text-[#8C63FF]"
          name="banner_layout"
          value={layout?._id}
          checked={
            bannerLayout === layout?._id || selectedBannerType === layout?._id
          }
          onChange={() =>
            handleBannerType(
              layout?._id,
              layout?.isButton,
              layout?.pattern || "",
            )
          }
        />
        <span className="text-[#807C83] text-sm ml-2">{layout?.title}</span>
      </article>
      <span className="text-xs text-[#999999] w-48 leading-none">
        {layout?.description}
      </span>
    </section>
  );
};

const SelectingCardLayout = memo(MemoSelectingCardLayout);
export default SelectingCardLayout;
