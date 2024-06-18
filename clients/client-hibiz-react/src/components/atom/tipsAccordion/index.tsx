import useTimings from '@/components/store/useTimings';
import { Disclosure } from '@headlessui/react';
import { memo } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
import BillSummary from '../billSummary';

interface IProps {
  tips: any;
  pageNumberFunction: (data: number) => void;
  currentPage: number;
}
const TipsAccordion = memo(({ tips, pageNumberFunction, currentPage }: IProps) => {
  const { inTime, outTime } = useTimings();

  const handleClick = (newPage: number) => {
    if (newPage < 1) return;
    pageNumberFunction(newPage);
  };
  return (
    <>
      <div className="relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[10rem]">
        {tips && tips.length > 0 ? (
          tips.map((bill: any, index: number) => (
            <div key={index.toString()}>
              {bill?.tips > 0 && (
                <Disclosure>
                  {({ open }) => (
                    <div className="rounded-xl border border-[#cacaca]">
                      <Disclosure.Button className={`w-full rounded-xl p-4 ${bill?.settle ? 'border-[#219653] bg-[#219653]/10' : ''}`}>
                        <div className="flex justify-between">
                          <div className="font-medium">₹ {bill?.total}</div>
                          <div className="text-sm opacity-60">
                            {bill?.paymentDate} {bill?.time}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-base font-medium opacity-70">{bill?.waiterName || bill?.customerName}</div>
                          <div>
                            <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                          </div>
                        </div>
                      </Disclosure.Button>
                      <Disclosure.Panel className="mx-4 text-sm">
                        <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                          <div className="flex items-center">
                            <MdPerson className="" />
                            <span className="ml-2">{bill?.waiterName || bill?.customerName}</span>
                          </div>
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
                          {bill.items
                            ? bill?.items?.map((item: any, index: number) => (
                                <div className="mt-1  font-medium opacity-70" key={index.toString()}>
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
                  )}
                </Disclosure>
              )}
            </div>
          ))
        ) : (
          <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">
            No Tips Found
            <div className="text-base">{inTime && outTime ? `(${inTime} to ${outTime}  )` : ''}</div>
          </div>
        )}
      </div>
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {tips && tips.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-base text-black"
          >
            <BiChevronsLeft />
          </button>
        )}
        <p className="flex h-10 w-10 items-center justify-center rounded-full border border-[#000000] bg-white text-black">{currentPage}</p>
        {tips && tips.length > 0 && (
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
});
export default TipsAccordion;
