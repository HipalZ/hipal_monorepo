import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CiFilter } from "react-icons/ci";
import { HiSearch } from "react-icons/hi";
import SearchPanel from "@/components/atoms/searchPanel";
import { useLiteStore } from "../store/useLiteStore";
import { memo, useCallback } from "react";

const MemoFilter = () => {
  const { isAscending, setIsAscending, setShowSearchBox, showSearchBox } =
    useLiteStore((s) => ({
      isAscending: s.isAscending,
      setIsAscending: s.setIsAscending,
      showSearchBox: s.showSearchBox,
      setShowSearchBox: s.setShowSearchBox,
    }));

  const toggleSearchPanel = useCallback(() => {
    setShowSearchBox(!showSearchBox);
  }, [setShowSearchBox, showSearchBox]);

  const handleSort = useCallback(
    (order: "asc" | "desc") => {
      setIsAscending(order === "asc");
    },
    [setIsAscending],
  );

  return (
    <div className="flex items-center">
      {!showSearchBox ? (
        <Menu as="div" className="relative">
          <MenuButton className="flex items-center px-4 py-2 space-x-2 text-white bg-black rounded-full z-1">
            <span>Filters</span>
            <CiFilter className="ml-2" />
          </MenuButton>
          <MenuItems className="absolute right-0 z-10 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    className={`${
                      focus ? "bg-gray-100 text-gray-900" : "text-black"
                    } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                    onClick={() => {
                      handleSort("desc");
                    }}
                  >
                    Oldest
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    disabled={isAscending}
                    className={`${
                      focus ? "bg-gray-100 text-gray-900" : "text-black"
                    } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                    onClick={() => {
                      handleSort("asc");
                    }}
                  >
                    Latest
                  </button>
                )}
              </MenuItem>
            </div>
          </MenuItems>
        </Menu>
      ) : null}
      {/* {!showSearchBox ? (
        <HiSearch
          onClick={toggleSearchPanel}
          className="w-4 h-4 mx-2 my-auto text-sm cursor-pointer"
        />
      ) : (
        <SearchPanel closeSearchBox={toggleSearchPanel} />
      )} */}
    </div>
  );
};

const Filter = memo(MemoFilter);
export default Filter;
