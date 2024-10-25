import { lazy, memo, useCallback, useMemo } from "react";
import { FaFilter } from "react-icons/fa";
import {
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
  bannerLayouts7,
  BannerType,
} from "@/components/utils/bannerLayouts";
import { useBannerTemp } from "@/components/store/useBannerTemp";

const FilterBanners = lazy(() => import("./filterBanners"));
const BannerLayout1 = lazy(() => import("./bannerLayout1"));
const BannerLayout2 = lazy(() => import("./bannerLayout2"));
const BannerLayout3 = lazy(() => import("./bannerLayout3"));
const BannerLayout4 = lazy(() => import("./bannerLayout4"));
const BannerLayout5 = lazy(() => import("./bannerLayout5"));
const BannerLayout6 = lazy(() => import("./bannerLayout6"));
const BannerLayout7 = lazy(() => import("./bannerLayout7"));

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
const MemoBannerLayouts = () => {
  const { selectedFilters, handleOpenFilters } = useBannerTemp((s) => ({
    selectedFilters: s.selectedFilters,
    handleOpenFilters: s.handleOpenFilters,
  }));

  const isLayoutVisible = useCallback(
    (layout: any) => {
      if (selectedFilters.includes("withButton") && !layout.isButton)
        return false;
      if (selectedFilters.includes("withoutButton") && layout.isButton)
        return false;
      if (selectedFilters.includes("withImage") && !layout.image) return false;
      if (selectedFilters.includes("withPattern") && !layout.isPattern)
        return false;
      return true;
    },
    [selectedFilters],
  );

  const combinedLayouts = useMemo(
    () => [
      ...bannerLayouts,
      ...bannerLayouts2,
      ...bannerLayouts3,
      ...bannerLayouts4,
      ...bannerLayouts5,
      ...bannerLayouts6,
      ...bannerLayouts7,
    ],
    [],
  );

  // Filter the combined layouts
  const filteredLayouts = combinedLayouts.filter(isLayoutVisible);
  return (
    <section className="relative">
      <div
        onClick={handleOpenFilters}
        onKeyUp={handleOpenFilters}
        className="max-w-[69rem] flex justify-end z-10 m-4 rounded-t-2xl"
      >
        <FaFilter />
      </div>
      <section className="relative grid content-center grid-cols-2 gap-y-4 place-items md:grid-cols-3 lg:grid-cols-4 pb-[5rem] px-2 space-x-2">
        {filteredLayouts.map((layout) => {
          const LayoutComponent =
            layoutMap[layout?._id || BannerType.BANNER_TYPE_1];
          return LayoutComponent ? (
            <LayoutComponent layout={layout} key={layout?._id} />
          ) : null;
        })}
      </section>
      <FilterBanners />
    </section>
  );
};

const BannerLayouts = memo(MemoBannerLayouts);
export default BannerLayouts;
