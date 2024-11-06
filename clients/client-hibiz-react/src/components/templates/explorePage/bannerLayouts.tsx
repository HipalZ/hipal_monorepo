import { lazy, memo, useCallback, useState } from "react";
import { FaFilter } from "react-icons/fa";
import {
  bannerLayouts,
  bannerLayouts2,
  bannerLayouts3,
  bannerLayouts4,
  bannerLayouts5,
  bannerLayouts6,
  bannerLayouts7,
} from "@/components/utils/bannerLayouts";

const PopUp = lazy(() => import("@/components/atom/popUp"));
const BannerLayout1 = lazy(
  () => import("../staticBannerLayouts/bannerLayout1"),
);
const BannerLayout2 = lazy(
  () => import("../staticBannerLayouts/bannerLayout2"),
);
const BannerLayout3 = lazy(
  () => import("../staticBannerLayouts/bannerLayout3"),
);
const BannerLayout4 = lazy(
  () => import("../staticBannerLayouts/bannerLayout4"),
);
const BannerLayout5 = lazy(
  () => import("../staticBannerLayouts/bannerLayout5"),
);
const BannerLayouts6 = lazy(
  () => import("../staticBannerLayouts/bannerLayout6"),
);
const BannerLayouts7 = lazy(
  () => import("../staticBannerLayouts/bannerLayout7"),
);

const MemoBannerLayouts = () => {
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleOpenFilters = useCallback(() => {
    setOpenFilter(!openFilter);
  }, [openFilter]);

  const toggleFilter = useCallback(
    (filter: string) => {
      setSelectedFilters((prev) =>
        prev.includes(filter)
          ? prev.filter((f) => f !== filter)
          : [...prev, filter],
      );
    },
    [selectedFilters],
  );

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

  const clearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, [selectedFilters]);

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
        {bannerLayouts.filter(isLayoutVisible).map((layout) => {
          return <BannerLayout1 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts2.filter(isLayoutVisible).map((layout) => {
          return <BannerLayout2 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts3.filter(isLayoutVisible).map((layout) => {
          return <BannerLayout3 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts4.filter(isLayoutVisible).map((layout) => {
          return <BannerLayout4 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts5.filter(isLayoutVisible).map((layout) => {
          return <BannerLayout5 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts6.filter(isLayoutVisible).map((layout) => {
          return <BannerLayouts6 layout={layout} key={layout?._id} />;
        })}
        {bannerLayouts7.filter(isLayoutVisible).map((layout) => {
          return <BannerLayouts7 layout={layout} key={layout?._id} />;
        })}
      </section>
      {openFilter && (
        <PopUp show={openFilter} onClose={handleOpenFilters}>
          <div className="h-[30vh] px-4 py-2">
            <h2 className="text-lg">Filter Options</h2>
            <div className="flex flex-wrap gap-2 mt-2 !text-sm">
              <div
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  selectedFilters.includes("withButton")
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
                onClick={() => toggleFilter("withButton")}
                onKeyDown={() => toggleFilter("withButton")}
              >
                With Button
              </div>
              <div
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  selectedFilters.includes("withoutButton")
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
                onClick={() => toggleFilter("withoutButton")}
                onKeyDown={() => toggleFilter("withoutButton")}
              >
                Without Button
              </div>
              <div
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  selectedFilters.includes("withImage")
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
                onClick={() => toggleFilter("withImage")}
                onKeyDown={() => toggleFilter("withImage")}
              >
                With Image
              </div>
              <div
                className={`cursor-pointer px-4 py-2 rounded-full ${
                  selectedFilters.includes("withPattern")
                    ? "bg-blue-200"
                    : "bg-gray-200"
                }`}
                onClick={() => toggleFilter("withPattern")}
                onKeyDown={() => toggleFilter("withPattern")}
              >
                No Image
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 mt-4 !text-sm text-white bg-red-500 rounded-full"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </PopUp>
      )}
    </section>
  );
};

const BannerLayouts = memo(MemoBannerLayouts);
export default BannerLayouts;
