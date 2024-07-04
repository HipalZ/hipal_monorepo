import { memo, useMemo, useState } from "react";
import { Menu } from '@headlessui/react';
import { CiFilter } from "react-icons/ci";
import { HiSearch } from "react-icons/hi";
import SearchPanel from "@/components/atoms/searchPanel";
import OnlineAlertCard from "../onlineAlertCard";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useSearch } from "@/components/store/useSearch";

const OnlineAlerts = () => {
    const { selectedNavItem, onlineAlertData } = useLiteStore((s)=>({
        selectedNavItem: s.selectedNavItem,
        onlineAlertData: s.onlineAlertData,
    }));
    const { searchText } = useSearch((s)=>({
        searchText: s.searchText,
    }));
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [isAscending, setIsAscending] = useState(true);

    const toggleSearchPanel = () => {
        setShowSearchBox(!showSearchBox);
    };

    const handleSort = (order: "asc" | "desc") => {
        setIsAscending(order === "asc");
    };

    const sortedAndFilteredData = useMemo(() => {
        let filteredData = [...onlineAlertData];

        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filteredData = filteredData.filter(item =>
                item.order_id?.total?.toString().includes(searchText) ||
                item.order_id?.name?.toLowerCase().includes(searchLower) ||
                item.order_id?.phone?.toLowerCase().includes(searchLower) ||
                (item.order_id?.claimedCoins?.toString().includes(searchLower))
            );
        }

        filteredData.sort((a, b) => a.date - b.date);
        return isAscending ? filteredData.reverse() : filteredData;
    }, [onlineAlertData, isAscending, searchText]);

    return (
        <>
            <div className="h-[2rem] px-4 py-8 flex justify-between items-center">
                <h1 className="text-lg font-semibold">Online Payments</h1>
                <div className="flex items-center">
                    {!showSearchBox ? <Menu as="div" className="relative">
                        <Menu.Button className="z-1 bg-black text-white space-x-2 flex items-center py-2 px-4 rounded-full">
                            <span>Filters</span>
                            <CiFilter className="ml-2" />
                        </Menu.Button>
                        <Menu.Items className="z-10 absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-black'
                                                } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                                            onClick={() => {
                                                handleSort("desc");
                                            }}
                                        >
                                            Oldest
                                        </button>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            disabled={isAscending}
                                            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-black'
                                                } group flex rounded-md items-center w-full px-2 py-2 text-base font-semibold`}
                                            onClick={() => {
                                                handleSort("asc");
                                            }}
                                        >
                                            Latest
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Menu> : null}
                    {!showSearchBox ? (
                        <HiSearch onClick={toggleSearchPanel} className="mx-2 my-auto h-4 w-4 text-sm cursor-pointer" />
                    ) : (
                            <SearchPanel closeSearchBox={toggleSearchPanel} />
                        )}
                </div>
            </div>
            <OnlineAlertCard selectedNavItem={selectedNavItem} onlineAlertData={sortedAndFilteredData} />
        </>
    );
}

const OnlineAlertsMemo = memo(OnlineAlerts);
export default OnlineAlertsMemo;
