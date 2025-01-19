import { memo } from "react";
import { FaSearch } from "react-icons/fa";
import {
  useZonesAndTablesStore,
} from "../store/useZonesAndTable";

const MemoTableSearch = () => {
  const { setSearchQuery, searchQuery } =
    useZonesAndTablesStore();


  return (
    <div className="relative flex-1 px-4 mt-6 space-y-6 sm:px-6">
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700"
        >
          Search Tables
        </label>
        <div className="relative mt-1 rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="block w-full py-2 pl-10 pr-4 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by Table Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

    </div>
  );
};

const TableSearch = memo(MemoTableSearch);
export default TableSearch;
