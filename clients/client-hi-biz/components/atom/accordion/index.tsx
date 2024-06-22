import axios from '@/axios';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { usePaymentMethodsStore } from '@/components/store/usePaymentStore';
import useTimings from '@/components/store/useTimings';
import useDiscountStore from '@/components/store/useValueStore';
import type { BillsData } from '@/components/types/businessData';
import { Disclosure } from '@headlessui/react';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { AiFillCaretDown } from 'react-icons/ai';
import { BiChevronsLeft, BiChevronsRight } from 'react-icons/bi';
import { MdPerson } from 'react-icons/md';
import { toast } from 'react-toastify';
import BillSummary from '../billSummary';
import LoadingSpinner from '../loadingSpinner';
import PopUp from '../popUp';
import SplitPaymentModal from '../splitPayment';

export interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}

function Bills({
  billsData,
  isLoadingBills,
  fetchBillsData,
  pageNumberFunction,
}: {
  billsData: BillsData | null;
  isLoadingBills: boolean;
  fetchBillsData: () => void;
  pageNumberFunction: (newPage: number) => void;
}) {
  const { inTime, outTime } = useTimings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [footButton, setFootButton] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPopup, setLoadingPopup] = useState(false);
  const userName = useOwnerLogin((s) => s.user?.name);
  const [editBillId, setEditBillId] = useState('');
  const { paymentMethods, lastUpdated, setPaymentMethods } = usePaymentMethodsStore();
  const { selectedPaymentMethod, setSelectedPaymentMethod, multiplePaymentMethods, setMultiplePaymentMethods } = useDiscountStore();
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const [currentPage, setCurrentPage] = useState(1);
  const handleClick = (newPage: number) => {
    setCurrentPage(newPage);
    pageNumberFunction(newPage);
  };
  const openModal = async (modalContent: string) => {
    setFootButton(modalContent);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFootButton('');
  };

  const handlePaymentMethodSelection = async (methodId: string) => {
    if (methodId.toLowerCase() === 'split payment') {
      setSelectedPaymentMethod(methodId);
      openModal(methodId);
    } else if (selectedPaymentMethod === methodId) {
      setSelectedPaymentMethod('');
    } else {
      setSelectedPaymentMethod(methodId);
    }
  };
  const handleMultiplePaymentMethodSelection = (methodId: string) => {
    if (multiplePaymentMethods.includes(methodId)) {
      setMultiplePaymentMethods(multiplePaymentMethods.filter((method) => method !== methodId));
    } else {
      setMultiplePaymentMethods([...multiplePaymentMethods, methodId]);
    }
  };

  const finalClick = async () => {
    if (!selectedPaymentMethod) {
      return toast.error('Please Select the Mode');
    }
    if (selectedPaymentMethod === 'split payment') {
      return toast.error('Please Select different Mode');
    }
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const config = {
        method: 'put',
        url: `/v1/payments/${editBillId}`,
        data: {
          mode: selectedPaymentMethod,
          waiterName: userName,
        },
      };
      const res = await axios(config);
      if (res.status) {
        toast.success('paymode updated successfully');
        setSelectedPaymentMethod('');
        setEditBillId('');
        fetchBillsData();
        closeModal();
      }
    } catch (error: any) {
      toast.error(error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const splitFinalClick = async (data: any) => {
    if (!selectedPaymentMethod) {
      return toast.error('Please Select the Mode');
    }
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const config = {
        method: 'put',
        url: `/v1/payments/${editBillId}`,
        data: {
          mode: 'multiple',
          modeBreakDown: data,
          waiterName: userName,
        },
      };

      const res = await axios(config);
      if (res.status) {
        setMultiplePaymentMethods([]);
        toast.success('paymode updated successfully');
        setEditBillId('');
        fetchBillsData();
        closeModal();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    router.query.tab = 'Bills';
    router.push(router);
  }, []);

  const fetchPaymentMethods = async () => {
    if (!(lastUpdated === null || Date.now() - lastUpdated > 3 * 60000)) {
      return;
    }
    try {
      const response = await axios.get(`/v1/payments/Get/Modes?businessId=${businessId}`);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
    }
  };

  return (
    <>
      {billsData && billsData.length > 0 ? (
        <div className="masonry-layout relative mt-6 w-full space-y-4 overflow-auto scroll-smooth px-6 pb-[10rem]">
          {billsData.map((bill, index) => (
            <div key={index.toString()}>
              <Disclosure>
                {({ open }) => {
                  let formattedEntries: any;
                  if (bill?.mode?.toLowerCase() === 'multiple') {
                    formattedEntries = Object.entries(bill?.modeBreakDown)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join('\n');
                  }
                  return (
                    <>
                      <div className="masonry-item rounded-xl border border-[#cacaca] ">
                        <Disclosure.Button className="w-full p-4 ">
                          <div className="flex justify-between">
                            <div className="font-medium">₹ {bill?.total}</div>
                            <div className="text-sm opacity-60">
                              {bill?.paymentDate} {bill?.time}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-base font-medium opacity-70">
                              {bill?.customerName === 'undefined' ? bill?.waiterName.slice(0, 16) : bill?.customerName.slice(0, 16)}
                            </div>
                            <div className="flex items-center">
                              <div>{bill?.tableName}</div>
                              <AiFillCaretDown className={`ml-2 h-3 w-3 ${open ? 'rotate-180 transform' : ''}`} />
                            </div>
                          </div>
                        </Disclosure.Button>
                        <Disclosure.Panel className="mx-4 text-sm">
                          <div className="flex justify-between border-y border-[#cacaca] py-4 text-base opacity-70">
                            <div className="flex items-center">
                              <MdPerson />
                              <span className="ml-2">{bill?.waiterName.slice(0, 16)}</span>
                            </div>
                            <div className="capitalize">
                              {bill?.mode?.toLowerCase() === 'multiple' ? <pre className="text-sm font-medium">{formattedEntries}</pre> : bill?.mode}
                            </div>
                          </div>
                          {/* Here you can add code to display items and their amounts */}
                          <div className="border-b border-[#cacaca] pb-4">
                            <div className="mt-4 font-medium">
                              <div className="flex justify-between font-medium">
                                <span>Items</span>
                                <span>Rupees</span>
                              </div>
                            </div>
                            {bill.items &&
                              bill?.items?.map((item, index) => (
                                <div className="mt-1 font-medium opacity-70" key={index}>
                                  <div className="flex justify-between font-medium">
                                    <span>{item?.name}</span>
                                    <span>₹ {item?.amount}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                          <BillSummary {...bill} />
                          <div
                            onClick={async () => {
                              setLoadingPopup(true);
                              await fetchPaymentMethods();
                              setLoadingPopup(false);
                              openModal('settle');
                              setEditBillId(bill?._id);
                            }}
                            className="mb-4 rounded-md border border-[#cacaca] py-1 text-center font-semibold"
                          >
                            Edit Payment Mode
                          </div>
                          {isModalOpen && editBillId === bill._id && (
                            <PopUp show={isModalOpen} onClose={closeModal}>
                              {footButton.toLowerCase() === 'settle' && (
                                <div className="relative min-h-[70vh]">
                                  <div className="flex justify-between mt-4">
                                    <div className="ml-6 text-[1rem] font-[500] capitalize leading-[1.25rem] text-[#002D4B]">Payment Mode</div>
                                    <div className="mr-[1.5rem] text-[1rem] font-[500] capitalize leading-[1.25rem] text-[#002D4B]">
                                      ₹ {bill?.total}
                                    </div>
                                  </div>
                                  {loadingPopup ? (
                                    <LoadingSpinner />
                                  ) : paymentMethods.filter((method) => method?.mode !== 'dues').length > 0 ? (
                                    <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto pb-[7rem]">
                                      {paymentMethods
                                        .filter((method) => method?.mode !== 'dues')
                                        .map((method) => {
                                          return (
                                            <div key={method._id}>
                                              <div
                                                className={`${
                                                  bill?.mode === method?.mode ? 'pointer-events-none opacity-50' : ''
                                                } flex items-center rounded-xl border px-4 py-2`}
                                                onClick={() => handlePaymentMethodSelection(method?.mode)}
                                              >
                                                <input
                                                  id={`method-${method._id}`}
                                                  type="checkbox"
                                                  value={selectedPaymentMethod}
                                                  checked={selectedPaymentMethod === method?.mode}
                                                />
                                                <div className="ml-4 font-medium capitalize line-clamp-1">{method?.mode}</div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                    </div>
                                  ) : (
                                    <div className="text-center">No payment modes found</div>
                                  )}

                                  <div className="shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full max-w-[28rem] bg-[#2b354d] py-2 shadow-lg">
                                    <button
                                      type="button"
                                      className="absolute bottom-3 left-2 rounded-full bg-[#2b354d]  px-4 py-2 text-base font-[500] text-white"
                                    >
                                      ₹ Payment Modes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={finalClick}
                                      className={`absolute bottom-3 right-6 z-50 mr-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-[500] text-[#2b354d] ${
                                        loading ? 'cursor-not-allowed opacity-50' : ''
                                      }`}
                                      disabled={loading}
                                    >
                                      {loading ? 'Loading...' : 'Continue'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {footButton.toLowerCase() === 'split payment' && (
                                <div className="relative min-h-[80vh]">
                                  <div className="flex justify-between mt-4">
                                    <div className="ml-6 text-[1rem] font-[500] capitalize leading-[1.25rem] text-[#002D4B]">
                                      select payment methods
                                    </div>
                                    <div className="mr-[1.5rem] text-[1rem] font-[500] capitalize leading-[1.25rem] text-[#002D4B]">
                                      ₹ {bill?.total}
                                    </div>
                                  </div>
                                  <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto pb-[7rem]">
                                    {paymentMethods
                                      .filter(
                                        (method) => method?.mode !== 'dues' && method?.mode !== 'split payment' && method?.mode !== 'complimentary',
                                      )
                                      .map((method) => (
                                        <div
                                          key={method._id}
                                          className={`flex items-center rounded-xl border px-4 py-2 ${
                                            multiplePaymentMethods.includes(method?.mode) ? 'border-[#2b354d]' : ''
                                          }`}
                                          onClick={() => handleMultiplePaymentMethodSelection(method?.mode)}
                                        >
                                          <input
                                            id={`method-${method._id}`}
                                            type="checkbox"
                                            checked={multiplePaymentMethods.includes(method?.mode)}
                                          />
                                          <div className="ml-4 font-medium capitalize line-clamp-1">{method?.mode}</div>
                                        </div>
                                      ))}
                                  </div>

                                  <div className="shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full bg-[#2b354d] py-2 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (multiplePaymentMethods.length > 1) {
                                          openModal('split');
                                          return;
                                        } else {
                                          toast.error('select atleast 2 payment methods');
                                        }
                                      }}
                                      className={`absolute bottom-3 right-6 z-50 mr-2 rounded-full border border-white bg-white px-4 py-2 text-sm font-[500] text-[#2b354d] ${
                                        loading ? 'cursor-not-allowed opacity-50' : ''
                                      }`}
                                      disabled={loading}
                                    >
                                      {loading ? 'Loading...' : 'Continue'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              {footButton.toLowerCase() === 'split' && (
                                <SplitPaymentModal
                                  billAmount={bill?.total}
                                  selectedMethods={multiplePaymentMethods}
                                  splitFinalClick={splitFinalClick}
                                />
                              )}
                            </PopUp>
                          )}
                        </Disclosure.Panel>
                      </div>
                    </>
                  );
                }}
              </Disclosure>
            </div>
          ))}
        </div>
      ) : (
        <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/2">
          <p>No Bills Found</p>
          <span>
            {inTime && outTime && (
              <div className="text-base">
                ({inTime} to {outTime} )
              </div>
            )}
          </span>
        </div>
      )}
      <div className="fixed bottom-[5rem] left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center space-x-4">
        {billsData && billsData.length >= 0 && (
          <button
            type="button"
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
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
      {isLoadingBills && <LoadingSpinner />}
    </>
  );
}

export default memo(Bills);
