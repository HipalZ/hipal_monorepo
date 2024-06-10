import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import BillSummary from '@/components/atom/billSummary';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useCustomerzData } from '@/components/store/useCustomerzData';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import type { BillsData } from '@/components/types/businessData';
import { Disclosure } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import { memo, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { BsChevronLeft } from 'react-icons/bs';
import { MdPerson } from 'react-icons/md';
import { useParams } from 'react-router-dom';

function CustomerzBills() {
  const [billsData, setBillsData] = useState<BillsData>([]);
  const { customerzName, customerzPhone, setCustomerzName } = useCustomerzData();
  const { setSelectedSubIcon, selectedSubIcon } = useSelectedIcon();
  const [pageNumber, setPageNumber] = useState(1);
  const { businessId } = useParams<{
    businessId: string;
  }>();
  const handleClick = (newPage: number) => {
    setPageNumber(newPage);
  };

  const fetchBillsApi = async () => {
    try {
      const response = await axios.get(`/v1/payments/:id/customerBills?businessId=${businessId}&phone=${customerzPhone}&pageNumber=${pageNumber}`);
      setCustomerzName(response.data.customerName);
      setBillsData(response.data.bills);
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.log(err);
    }
  };

  const {
    isLoading: isBillsPending,
    error: billsError,
    data,
    refetch,
  } = useQuery({
    queryKey: ['bills', businessId, customerzPhone, selectedSubIcon === 'customerzBills', pageNumber],
    queryFn: fetchBillsApi,
    enabled: (!!businessId && !!customerzPhone && selectedSubIcon === 'customerzBills') || !!pageNumber,
  });

  if (isBillsPending) return <LoadingSpinner />;
  if (billsError) return <ErrorComponent refetch={refetch} />;

  return (
    <div className="bg-white">
      <div className="border-b border-[#CACACA] bg-[#f5f5f5]">
        <Header
          title="Bills"
          onBack={() => setSelectedSubIcon('')}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
        <div className="mx-6 mt-6 rounded-lg bg-[#204D42] py-4 text-white">
          <div className="flex items-center justify-start">
            <div className="mx-4 rounded-full bg-white px-4 py-2 text-xl font-semibold text-[#204D42]">{customerzName?.charAt(0)}</div>
            <div className="ml-2 text-xl font-normal">{customerzName}</div>
          </div>
        </div>
        <section className="mx-6 my-4">
          <article className="flex items-center justify-between">
            <h1 className="text-xl text-[#2B354D]">Bills</h1>
          </article>
        </section>
      </div>
      <section className="masonry-layout relative mt-2 w-full space-y-4 overflow-auto scroll-smooth px-6">
        {billsData && billsData.length > 0 ? (
          billsData.map((bill) => (
            <div key={bill._id}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <div className="bg-base-100 masonry-item rounded-xl border border-[#cacaca] ">
                      <Disclosure.Button className="w-full space-y-2 p-4">
                        <div className="flex justify-between">
                          <div className="font-medium">₹ {bill?.total}</div>
                          <div className="text-sm opacity-60">{bill?.paymentDate}</div>
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
      </section>
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {billsData && billsData.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber - 1)}
            disabled={pageNumber === 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-black">{pageNumber}</p>
        {billsData && billsData.length > 0 && (
          <button
            type="button"
            onClick={() => handleClick(pageNumber + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2B354D] bg-white text-base text-black"
          >
            <BiChevronsRight />
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(CustomerzBills);
