import { memo } from "react";
import { FaChevronUp } from "react-icons/fa";
import { useZonesAndTablesStore } from "../store/useZonesAndTable";
import UnivercelFilter from "./univercelFilter";

const MemoZoneFilters = () => {
  const { setIsFilterOpen } = useZonesAndTablesStore();

  return (
    <div className="flex flex-col min-h-[80dvh] py-6 hide-scrollbar overflow-y-scroll bg-white shadow-xl">
      <div className="px-4 sm:px-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Filter and Search
          </h3>
          <div className="flex items-center ml-3 h-7">
            <button
              type="button"
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setIsFilterOpen(false)}
            >
              <span className="sr-only">Close panel</span>
              <FaChevronUp className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <UnivercelFilter />
    </div>
  );
};

const ZoneFilters = memo(MemoZoneFilters);
export default ZoneFilters;
