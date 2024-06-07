import BillSummary from '@/components/atom/billSummary';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import type { Item } from '@/pages/business/[businessId]/loyalty/[loyaltyId]';
import { Disclosure } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';

const LoyaltyHistoryAccordion = ({
  itemsData,
  isLoading,
  pageNumberFunction,
  pageNumber,
}: {
  itemsData: Item[];
  isLoading: boolean;
  pageNumberFunction: (newPage: number) => void;
  pageNumber: number;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    setItems(itemsData);
  }, [itemsData]);
  const [currentPage, setCurrentPage] = useState(1);
  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
    pageNumberFunction(newPage);
  };

  return (
    <>
      <div className="masonry-layout relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[10rem]">
        {isLoading ? (
          <LoadingSpinner />
        ) : items.length > 0 ? (
          items.map((item) => (
            <Disclosure key={item._id}>
              {({ open }) => (
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div className="masonry-item rounded-xl border border-[#cacaca]">
                        <Disclosure.Button
                          className={`w-full rounded-t-xl px-4 py-2 ${item?.status === 'plus' ? 'border-[#219653] bg-[#EEF7EA] text-[#3E5743]' : ''}`}
                        >
                          <div
                            className={`flex justify-between  ${
                              item?.status === 'plus' ? 'font-semibold text-[#3E5743]' : 'font-semibold text-[#F2634C]'
                            }`}
                          >
                            <div className="space-x-2">
                              <span>₹ {item?.rewards}</span>
                              {<span className="text-sm">{item?.status === 'plus' ? 'added' : 'deducted'}</span>}
                            </div>
                            <div className="text-sm font-normal opacity-60">
                              {item?.day} {item?.time}
                            </div>
                          </div>

                          <div className="flex items-center justify-between space-y-4 ">
                            <div className={`mt-2 text-sm font-medium opacity-70 ${item?.status === 'plus' ? 'text-[#3E5743]' : ''}`}>
                              <span className="capitalize"> {item?.userName}</span> <span className="">( {item?.userPhone} )</span>
                            </div>
                            <div className="flex items-center">
                              <p>{item?.tableName}</p>
                              <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                            </div>
                          </div>
                        </Disclosure.Button>

                        <Disclosure.Panel className="mx-4 text-sm">
                          <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                            <div className="flex items-center">
                              <MdPerson className="" />
                              <span className="ml-2">{item?.waiterName}</span>
                            </div>{' '}
                            <div>{item?.tableName}</div>
                          </div>
                          {/* Here you can add code to display items and their amounts */}
                          <div className="border-b border-[#cacaca] pb-4">
                            <div className="mt-4 font-medium">
                              <div className="flex justify-between font-medium">
                                <span>items</span>
                                <span>Rupees</span>
                              </div>
                            </div>
                            {item?.items?.map((item: Item, index: number) => (
                              <div className="mt-1 font-medium opacity-70" key={index.toString()}>
                                <div className="flex justify-between font-medium">
                                  <span>{item?.name}</span>
                                  <span>₹ {item?.amount || item?.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <BillSummary {...item} />
                        </Disclosure.Panel>
                      </div>
                    </>
                  )}
                </Disclosure>
              )}
            </Disclosure>
          ))
        ) : (
          <>
            <span className="fixed left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">No data Found</span>
          </>
        )}
      </div>
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {items && items.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">
          {pageNumber || currentPage}
        </p>
        {items && items.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    </>
  );
};

export default LoyaltyHistoryAccordion;
