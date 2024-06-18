import axios from '@/axios';
import useTimings from '@/components/store/useTimings';
import type { Bill } from '@/components/types/businessData';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import BillSummary from '../billSummary';
import LoadingSpinner from '../loadingSpinner';

interface IDiscount extends Bill {
  totalDiscount: number;
  data: Bill[];
}
function SalesDiscount() {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
  };
  const { inTime, outTime } = useTimings();

  // sales report api
  const getSalesReport = async () => {
    let url = `/v1/payments/:id/discount?businessId=${businessId}&pageNumber=${currentPage}`;
    if (inTime && outTime) {
      url += `&from=${inTime}&to=${outTime}`;
    }
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') !== 'Discount') {
      params.set('tab', 'Discount');
      startTransition(() => {
        navigate({ search: params.toString() }, { replace: true });
      });
    }
  }, [location, navigate]);

  const {
    isLoading,
    error,
    data: salesData,
  } = useQuery<IDiscount>({
    queryKey: ['discount', businessId, currentPage, inTime, outTime],
    queryFn: getSalesReport,
    enabled: !!businessId && !!inTime && !!outTime && !!currentPage,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div className="mx-6 mt-6 rounded-lg bg-[#204D42] p-4 text-white">
        <div className="pb-2 text-xs">Total discounts</div>
        <div className="text-3xl font-normal">₹ {salesData?.totalDiscount}</div>
      </div>
      {salesData && salesData.data.length > 0 ? (
        <div className="masonry-layout mx-6 mt-6 pb-[6rem]">
          {salesData.data.map((bill: Bill, index: number) => (
            <div key={index.toString()}>
              {bill?.discount > 0 && (
                <Disclosure>
                  {({ open }) => (
                    <>
                      <div className="masonry-item rounded-xl border border-[#cacaca]">
                        <Disclosure.Button className={`w-full rounded-xl p-4 ${bill?.settle ? 'border-[#219653] bg-[#219653]/10' : ''}`}>
                          <div className="flex justify-between">
                            <div className="font-medium">₹ {bill?.total}</div>
                            <div className="text-sm opacity-60">
                              {bill?.paymentDate} {bill?.time}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-base font-medium opacity-70">
                              {bill?.customerName === 'undefined' ? bill?.waiterName : bill?.customerName.slice(0, 16)}
                            </div>
                            <div>
                              <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                            </div>
                          </div>
                        </Disclosure.Button>
                        <Disclosure.Panel className="mx-4 text-sm">
                          <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                            <div className="flex items-center">
                              <MdPerson className="" />
                              <span className="ml-2">{bill?.waiterName.slice(0, 16)}</span>
                            </div>
                            <div>{bill?.tableName}</div>
                          </div>
                          <div className=" pb-4">
                            <div className="mt-4 font-medium">
                              <div className="flex justify-between font-medium">
                                <span>items</span>
                                <span>Rupees</span>
                              </div>
                            </div>
                            {bill.items
                              ? bill?.items?.map((item: any, index: number) => (
                                  <div className="mt-1 font-medium opacity-70" key={index.toString()}>
                                    <div className="flex justify-between font-medium">
                                      <span>{item?.name}</span>
                                      <span>₹ {item?.amount}</span>
                                    </div>
                                  </div>
                                ))
                              : null}
                          </div>

                          <BillSummary {...bill} />
                        </Disclosure.Panel>
                      </div>
                    </>
                  )}
                </Disclosure>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">
          <p>No Discounts Found</p>
          {inTime && outTime && (
            <div className="text-base">
              ({inTime} to {outTime})
            </div>
          )}
        </div>
      )}
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {salesData && salesData.data.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-black">{currentPage}</p>
        {salesData && salesData.data.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    </>
  );
}

export default memo(SalesDiscount);
