import SearchPanel from "@/components/atoms/searchPanel";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useSearch } from "@/components/store/useSearch";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { memo, useMemo, useState } from "react";
import { CiFilter } from "react-icons/ci";
import { HiSearch } from "react-icons/hi";
import OfflineAlertCard from "../offlineAlertCard";

const OfflineAlerts = () => {
  const { offlineAlertData } = useLiteStore((s) => ({
    offlineAlertData: s.offlineAlertData,
  }));
  const { searchText } = useSearch((s) => ({
    searchText: s.searchText,
  }));
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isAscending, setIsAscending] = useState(false);

  const toggleSearchPanel = () => {
    setShowSearchBox(!showSearchBox);
  };

  const handleSort = (order: "asc" | "desc") => {
    setIsAscending(order === "asc");
  };

  const sortedAndFilteredData = useMemo(() => {
    const data = Array.isArray(offlineAlertData) ? offlineAlertData : [];
    let filteredData = [...data];

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredData = filteredData.filter(
        (item) =>
          item.order_id?.total?.toString().includes(searchText) ||
          item.order_id?.name?.toLowerCase().includes(searchLower) ||
          item.order_id?.phone?.toLowerCase().includes(searchLower) ||
          item.order_id?.claimedCoins?.toString().includes(searchLower),
      );
    }

    filteredData.sort((a, b) => a.date - b.date);
    return isAscending ? filteredData : filteredData.reverse();
  }, [offlineAlertData, isAscending, searchText]);

  return (
    <>
      <div className="flex h-[2rem] items-center justify-between px-4 py-8">
        <h1 className="text-lg font-semibold">On floor</h1>
        <div className="flex items-center">
          {!showSearchBox ? (
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center px-4 py-2 space-x-2 text-white bg-black rounded-full">
                <span>Filters</span>
                <CiFilter className="ml-2" />
              </MenuButton>
              <MenuItems className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        disabled={isAscending}
                        className={`${
                          focus ? "bg-gray-100 text-gray-900" : "text-black"
                        } group flex w-full items-center rounded-md px-2 py-2 text-base font-semibold`}
                        onClick={() => {
                          handleSort("asc");
                        }}
                      >
                        Ascending
                      </button>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        type="button"
                        className={`${
                          focus ? "bg-gray-100 text-gray-900" : "text-black"
                        } group flex w-full items-center rounded-md px-2 py-2 text-base font-semibold`}
                        onClick={() => {
                          handleSort("desc");
                        }}
                      >
                        Descending
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          ) : null}
          {!showSearchBox ? (
            <HiSearch
              onClick={toggleSearchPanel}
              className="w-4 h-4 mx-2 my-auto text-sm cursor-pointer"
            />
          ) : (
            <SearchPanel closeSearchBox={toggleSearchPanel} />
          )}
        </div>
      </div>
      <OfflineAlertCard offlineAlertData={sortedAndFilteredData} />
    </>
  );
};

const OfflineAlertsMemo = memo(OfflineAlerts);
export default OfflineAlertsMemo;
