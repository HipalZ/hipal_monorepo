import { useIsExplorePage } from "@/hooks/useExplore";
import { useEditBanner } from "../../helpers/bannersHelper";
import type { BannerProps } from "@/components/types/businessData";
import { memo } from "react";

const MemoBannerLayout7 = (props: BannerProps) => {
  const { banner } = props;
  const isExplorePage = useIsExplorePage();
  const { handleEditBanner } = useEditBanner();
  return (
    <button
      type="button"
      key={banner?._id}
      className="border border-1 border-[#000] rounded-2xl overflow-hidden shrink-0 max-w-[12rem] w-full md:max-w-[14rem] lg:max-w-[17rem] aspect-square"
      onClick={isExplorePage ? null : () => handleEditBanner(banner || {})}
    >
      <img
        src={banner?.bannerImage}
        alt="logo"
        className="object-cover  object-top w-full max-w-[12rem] md:max-w-[14rem] lg:max-w-[17rem] aspect-square"
      />
    </button>
  );
};

const BannerLayout7 = memo(MemoBannerLayout7);
export default BannerLayout7;
