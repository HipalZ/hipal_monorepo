import { memo } from "react";
import { BannerType } from "@/components/utils/bannerLayouts";
import { useBannerStore } from "@/components/store/useBannerStore";
import BannerLayout1 from "./bannerLayout1";
import BannerLayout2 from "./bannerLayout2";
import BannerLayout3 from "./bannerLayout3";
import BannerLayout4 from "./bannerLayout4";
import BannerLayout5 from "./bannerLayout5";
import BannerLayout6 from "./bannerLayout6";
import BannerLayout7 from "./bannerLayout7";

// Mapping of layouts to their respective components

const layoutMap = {
  [BannerType.BANNER_TYPE_1]: BannerLayout1,
  [BannerType.BANNER_TYPE_2]: BannerLayout1,
  [BannerType.BANNER_TYPE_3]: BannerLayout2,
  [BannerType.BANNER_TYPE_4]: BannerLayout2,
  [BannerType.BANNER_TYPE_5]: BannerLayout3,
  [BannerType.BANNER_TYPE_6]: BannerLayout3,
  [BannerType.BANNER_TYPE_7]: BannerLayout4,
  [BannerType.BANNER_TYPE_8]: BannerLayout4,
  [BannerType.BANNER_TYPE_9]: BannerLayout5,
  [BannerType.BANNER_TYPE_10]: BannerLayout5,
  [BannerType.BANNER_TYPE_11]: BannerLayout6,
  [BannerType.BANNER_TYPE_12]: BannerLayout6,
  [BannerType.BANNER_TYPE_13]: BannerLayout6,
  [BannerType.BANNER_TYPE_14]: BannerLayout7,
};

const MemoBannerDynamicLayout = () => {
  const { selectedBannerType } = useBannerStore((s) => ({
    selectedBannerType: s.selectedBannerType,
  }));
  const LayoutComponent = layoutMap[selectedBannerType || ""];

  return LayoutComponent ? <LayoutComponent /> : null;
};

const BannerDynamicLayout = memo(MemoBannerDynamicLayout);
export default BannerDynamicLayout;
