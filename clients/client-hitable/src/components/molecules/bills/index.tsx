import BillSummary from '@/components/atoms/billSummary';
import type { BillsData } from '@/components/types/hiTableData';
import { Disclosure } from '@headlessui/react';
import { memo } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
export interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}

function Bills({
  billsData,
  pageNumber: currentPage,
  pageNumberFunction,
}: {
  billsData: BillsData | null;
  pageNumber: number;
  pageNumberFunction: (newPage: number) => void;
}) {
  const handleClick = (newPage: number) => {
    if (newPage < 1) return;
    pageNumberFunction(newPage);
  };

  return (
    <>
      <div className="masonry-layout relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[10rem]">
        {billsData && billsData.length > 0 ? (
          billsData.map((bill) => (
            <div key={bill.id}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <div className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] ">
                      <Disclosure.Button className="w-full space-y-2 p-4">
                        <div className="flex justify-between">
                          <div className="font-medium">₹ {bill?.total}</div>
                          <div className="text-sm opacity-60">
                            {bill?.date?.slice(0, 16)} | {bill?.time}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-base font-medium opacity-70">
                            {bill.customerName === 'undefined' ? bill?.waiterName : bill?.customerName?.slice(0, 16)}
                          </div>
                          <div className="flex items-center justify-end">
                            <div className="opacity-60">{bill?.tableName}</div>
                            <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                          </div>
                        </div>
                      </Disclosure.Button>

                      <Disclosure.Panel className="mx-4 text-sm">
                        <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                          <div className="flex items-center">
                            <MdPerson className="" />
                            <span className="ml-2">{bill?.waiterName}</span>
                          </div>{' '}
                          <div>{bill?.mode}</div>
                        </div>
                        {/* Here you can add code to display items and their amounts */}
                        <div className="border-b border-[#cacaca] pb-4">
                          <div className="mt-4 font-medium">
                            <div className="flex justify-between font-medium">
                              <span>items</span>
                              <span>Rupees</span>
                            </div>
                          </div>
                          {bill?.items?.map((item, index) => (
                            <div className="mt-1 font-medium opacity-70" key={`${item.name}-${item.amount}${index}`}>
                              <div className="flex justify-between font-medium">
                                <span>{item?.name}</span>
                                <span>₹ {item?.amount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <BillSummary {...bill} />
                      </Disclosure.Panel>
                    </div>
                  </>
                )}
              </Disclosure>
            </div>
          ))
        ) : (
          <div className="text-primary mt-4 text-center text-xl font-medium opacity-60">No Bills Found</div>
        )}
      </div>
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {billsData && billsData.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">{currentPage}</p>
        {billsData && billsData.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    </>
  );
}

export default memo(Bills);
