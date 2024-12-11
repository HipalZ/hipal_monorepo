import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  Transition,
} from "@headlessui/react";
import { FaSearch, FaChevronUp } from "react-icons/fa";
import {
  type FilterType,
  useZonesAndTablesStore,
} from "../store/useZonesAndTable";

export const ZonesAndTables = () => {
  const {
    setActiveFilter,
    activeFilter,
    setSearchQuery,
    isFilterOpen,
    searchQuery,
    setIsFilterOpen,
  } = useZonesAndTablesStore();

  const filters = [
    { label: "All Tables", value: "all" as FilterType },
    { label: "Active Tables", value: "active" as FilterType },
    { label: "Inactive Tables", value: "inactive" as FilterType },
  ];

  return (
    <Transition show={isFilterOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setIsFilterOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <DialogPanel className="w-screen max-w-md pointer-events-auto">
                  <div className="flex flex-col h-full py-6 overflow-y-scroll bg-white shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                          Filter and Search
                        </DialogTitle>
                        <div className="flex items-center ml-3 h-7">
                          <button
                            type="button"
                            className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <FaChevronUp
                              className="w-6 h-6"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
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
                            <FaSearch
                              className="w-5 h-5 text-gray-400"
                              aria-hidden="true"
                            />
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

                      <div>
                        <span className="block text-sm font-medium text-gray-700">
                          Filter Tables
                        </span>
                        <div className="flex items-center mt-2 space-x-2">
                          {filters.map((filter) => (
                            <button
                              key={filter.value}
                              type="button"
                              onClick={() => setActiveFilter(filter.value)}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                activeFilter === filter.value
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
