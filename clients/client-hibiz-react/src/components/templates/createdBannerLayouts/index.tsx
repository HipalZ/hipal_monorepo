import type { IBannerPayload } from "@/components/types/businessData";
import { lazy, memo } from "react";
import { BannerType } from "@/components/utils/bannerLayouts";
const BannerLayout1 = lazy(() => import("./bannerLayout1"));
const BannerLayout2 = lazy(() => import("./bannerLayout2"));
const BannerLayout3 = lazy(() => import("./bannerLayout3"));
const BannerLayout4 = lazy(() => import("./bannerLayout4"));
const BannerLayout5 = lazy(() => import("./bannerLayout5"));
const BannerLayout6 = lazy(() => import("./bannerLayout6"));
const BannerLayout7 = lazy(() => import("./bannerLayout7"));
import { useLayoutObject } from "../../helpers/bannersHelper";

interface Props {
  banner: IBannerPayload;
}

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

const MemoBannersExplorePage = (props: Props) => {
  const { banner } = props;
  const layout = useLayoutObject(banner?.layout || "");
  if (!layout) return <div>No layout available</div>;

  const LayoutComponent = layoutMap[banner?.layout || ""];
  return LayoutComponent ? (
    <LayoutComponent banner={banner} layout={layout} />
  ) : null;
};

const BannersExplorePage = memo(MemoBannersExplorePage);
export default BannersExplorePage;
