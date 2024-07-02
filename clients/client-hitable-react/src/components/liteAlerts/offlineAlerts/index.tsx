import SearchPanel from '@/components/atoms/searchPanel';
import { useLiteStore } from '@/components/store/useLiteStore';
import { useSearch } from '@/components/store/useSearch';
import { Menu } from '@headlessui/react';
import { memo, useMemo, useState } from 'react';
import { CiFilter } from 'react-icons/ci';
import { HiSearch } from 'react-icons/hi';
import OfflineAlertCard from '../offlineAlertCard';

const OfflineAlerts = memo(() => {
  const { offlineAlertData } = useLiteStore();
  const { searchText } = useSearch();
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isAscending, setIsAscending] = useState(false);

  const toggleSearchPanel = () => {
    setShowSearchBox(!showSearchBox);
  };

  const handleSort = (order: 'asc' | 'desc') => {
    setIsAscending(order === 'asc');
  };

  const sortedAndFilteredData = useMemo(() => {
    let filteredData = [...offlineAlertData];

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
              <Menu.Button className="flex items-center space-x-2 rounded-full bg-black px-4 py-2 text-white">
                <span>Filters</span>
                <CiFilter className="ml-2" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        disabled={isAscending}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-black'
                        } group flex w-full items-center rounded-md px-2 py-2 text-base font-semibold`}
                        onClick={() => {
                          handleSort('asc');
                        }}
                      >
                        Ascending
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-black'
                        } group flex w-full items-center rounded-md px-2 py-2 text-base font-semibold`}
                        onClick={() => {
                          handleSort('desc');
                        }}
                      >
                        Descending
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          ) : null}
          {!showSearchBox ? (
            <HiSearch onClick={toggleSearchPanel} className="mx-2 my-auto h-4 w-4 cursor-pointer text-sm" />
          ) : (
            <SearchPanel closeSearchBox={toggleSearchPanel} />
          )}
        </div>
      </div>
      <OfflineAlertCard offlineAlertData={sortedAndFilteredData} />
    </>
  );
});

export default OfflineAlerts;
