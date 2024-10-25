import { lazy, memo } from "react";
import { useBannerTemp } from "@/components/store/useBannerTemp";

const PopUp = lazy(() => import("@/components/atom/popUp"));

const MemoFilterBanners = () => {
  const {
    openFilter,
    selectedFilters,
    toggleFilter,
    clearFilters,
    handleOpenFilters,
  } = useBannerTemp((s) => ({
    openFilter: s.openFilter,
    selectedFilters: s.selectedFilters,
    toggleFilter: s.toggleFilter,
    clearFilters: s.clearFilters,
    handleOpenFilters: s.handleOpenFilters,
  }));

  return (
    <>
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
    </>
  );
};

const FilterBanners = memo(MemoFilterBanners);
export default FilterBanners;
