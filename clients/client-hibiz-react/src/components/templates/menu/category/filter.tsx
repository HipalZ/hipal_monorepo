import useMenuPageStore from "@/components/store/useMenuStorage";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { memo } from "react";
import { FiFilter } from "react-icons/fi";

const MemoFilter = () => {
  const { visibilityFilter, sortOrder, setVisibilityFilter, setSortOrder } =
    useMenuPageStore((state) => ({
      visibilityFilter: state.visibilityFilter,
      sortOrder: state.sortOrder,
      setVisibilityFilter: state.setVisibilityFilter,
      setSortOrder: state.setSortOrder,
    }));
  return (
    <section className="absolute right-4">
      <Menu as="div" className="relative text-left">
        <MenuButton className="absolute right-0 top-[4.5rem] lg:top-[1.5rem]">
          <FiFilter
            size={24}
            className="w-5 h-5 ml-2 -mr-1"
            aria-hidden="true"
          />
        </MenuButton>
        <MenuItems className="absolute right-4 z-50 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 shadow top-[4rem] lg:top-[1rem] rounded-2xl focus:outline-none">
          <div className="p-1">
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  className={`${
                    focus || visibilityFilter === "all"
                      ? "bg-[#C3B3F8] text-white"
                      : "text-gray-900"
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                  onClick={() => setVisibilityFilter("all")}
                >
                  All
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  className={`${
                    focus || visibilityFilter === "visible"
                      ? "bg-[#C3B3F8] text-white"
                      : "text-gray-900"
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                  onClick={() => setVisibilityFilter("visible")}
                >
                  Visible Only
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  className={`${
                    focus || visibilityFilter === "hidden"
                      ? "bg-[#C3B3F8] text-white"
                      : "text-gray-900"
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                  onClick={() => setVisibilityFilter("hidden")}
                >
                  Hidden Only
                </button>
              )}
            </MenuItem>
          </div>
          <div className="p-1">
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  className={`${
                    focus || sortOrder === "asc"
                      ? "bg-[#C3B3F8] text-white"
                      : "text-gray-900"
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                  onClick={() => setSortOrder("asc")}
                >
                  Sort Ascending
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  type="button"
                  className={`${
                    focus || sortOrder === "dec"
                      ? "bg-[#C3B3F8] text-white"
                      : "text-gray-900"
                  } group flex rounded-md items-center w-full p-2 text-sm`}
                  onClick={() => setSortOrder("dec")}
                >
                  Sort Descending
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
    </section>
  );
};

const Filter = memo(MemoFilter);

export default Filter;
