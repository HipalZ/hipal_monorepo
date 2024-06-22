import useTimings from '@/components/store/useTimings';
import type { IDuesData } from '@/components/types/businessData';
import { PAGE_TYPES, routePathsWithIds } from '@/components/utils/routes';
import {  Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { memo, startTransition, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import BillSummary from '../billSummary';

function LoyaltyAccordion({ activeDues }: { activeDues: IDuesData | null }) {
  const dues = activeDues?.items || [];
  const navigate = useNavigate();
  const { inTime, outTime } = useTimings();
  const { businessId, duesPersonId } = useParams<{
    businessId: string;
    duesPersonId: string;
  }>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = dues ? Math.ceil(dues.length / itemsPerPage) : 0;

  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const settleDues = () => {
    startTransition(() => {
      navigate(routePathsWithIds[PAGE_TYPES.CLEAR_DUE](businessId || '', duesPersonId || ''));
    });
  };

  return (
    <>
      <div className="relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[10rem]">
        {dues && dues.length > 0 ? (
          dues.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((bill, index) => (
            <div key={index.toString()}>
               <Disclosure  as="div" defaultOpen={true}>
                {({ open }) => (
                  <div className="rounded-xl border border-[#cacaca]">
                    <DisclosureButton className={`w-full rounded-xl p-4 ${bill?.settle ? 'border-[#219653] bg-[#219653]/10' : ''}`}>
                      <div className="flex justify-between">
                        <div className="font-medium">₹ {bill?.total}</div>
                        <div className="text-sm opacity-60">{bill?.date.slice(0, 16)}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-base font-medium opacity-70">{bill?.customerName}</div>
                        <div>
                          <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                        </div>
                      </div>
                    </DisclosureButton>

                    <DisclosurePanel className="mx-4 text-sm">
                      <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                        <div className="flex items-center">
                          <MdPerson className="" />
                          <span className="ml-2">{bill?.customerName}</span>
                        </div>{' '}
                        <div>{bill?.tableName}</div>
                      </div>
                      {/* Here you can add code to display items and their amounts */}
                      <div className=" pb-4">
                        <div className="mt-4 font-medium">
                          <div className="flex justify-between font-medium">
                            <span>items</span>
                            <span>Rupees</span>
                          </div>
                        </div>
                        {bill.items &&
                          bill?.items?.map((item, index) => (
                            <div className="mt-1  font-medium opacity-70" key={index}>
                              <div className="flex justify-between font-medium">
                                <span>{item?.name}</span>
                                <span>₹ {item?.amount}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                      <BillSummary {...bill} />
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            </div>
          ))
        ) : (
          <div>
            <div className="mt-4 text-center text-xl font-medium text-[#000000] opacity-60">
              No Dues Found {activeDues?.userName}
              <div className="text-base">({inTime && outTime ? `${inTime} to ${outTime} ` : ''} )</div>
            </div>
          </div>
        )}
        <div className="flex justify-center space-x-4">
          {dues && dues.length > 0 && (
            <button
              type="button"
              onClick={() => handleClick(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
            >
              <BiChevronsLeft />
            </button>
          )}

          {[...Array(totalPages)].map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleClick(idx + 1)}
              disabled={currentPage === idx + 1}
              className={`flex h-10 w-10 items-center justify-center ${
                currentPage === idx + 1
                  ? 'rounded-full border border-[#000000] bg-[#000000] text-white'
                  : 'rounded-full border border-[#000000] bg-white text-black'
              }`}
              style={{
                display: idx >= currentPage - 1 && idx <= currentPage + 1 ? 'inline-flex' : 'none',
              }}
            >
              {idx + 1}
            </button>
          ))}

          {dues && dues.length > 0 && (
            <button
              type="button"
              onClick={() => handleClick(currentPage < totalPages ? currentPage + 1 : totalPages)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
              disabled={currentPage === totalPages}
            >
              <BiChevronsRight />
            </button>
          )}
        </div>
      </div>
      <div onClick={settleDues} className="fixed bottom-6 w-full px-6">
        <button
          type="button"
          className="bottom_btn"
        >
          <div className="flex items-center justify-center">Add coins</div>
        </button>
      </div>
    </>
  );
}

export default memo(LoyaltyAccordion);
