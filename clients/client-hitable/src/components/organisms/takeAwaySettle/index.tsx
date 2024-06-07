//@ts-check
import axios from '@/axios';
import DayOutPopup from '@/components/atoms/dayoutPopup';
import { useBillStore } from '@/components/store/useBillStore';
import { useBusinessStore } from '@/components/store/useBusinessData';
import useDiscountStore from '@/components/store/useDiscountStore';
import { useLogin } from '@/components/store/useLogin';
import { useZoneStore } from '@/components/store/useZone';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { BiPlus } from 'react-icons/bi';
import { HiX } from 'react-icons/hi';
import { ImPrinter } from 'react-icons/im';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { toast } from 'react-toastify';
interface POSProps {
  activeButton: string;
}
interface PaymentMethod {
  businessId: string;
  mode: string;
  commission: number;
  id: string;
}
const BillItem = ({ title, value }) => (
  <div className="text-base-content mx-4 mt-1 flex justify-between text-sm capitalize">
    <div>{title}</div>
    <div>₹ {value}</div>
  </div>
);

const TakeAwaySettle: React.FC<POSProps> = ({ activeButton }) => {
  const { billData, setBillData } = useBillStore();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [footButton, setFootButton] = useState('');
  const { businessData } = useBusinessStore();
  const userData = useLogin((s) => s.userDetails);
  const zone = useZoneStore((s) => s.zone);
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useDiscountStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const router = useRouter();
  const { businessId, takeawayId, orderId } = router.query as {
    businessId: string;
    takeawayId: string;
    orderId: string;
  };
  const zoneName = useLogin((s) => s.zoneName);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRef = useRef<null | HTMLDivElement>(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<any>([]);
  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };
  const handleAddPhoneNumber = () => {
    if (newPhoneNumber) {
      const phoneNumberWithPrefix = '91' + newPhoneNumber;
      setSelectedPhoneNumbers((prevPhoneNumbers) => {
        if (!prevPhoneNumbers.includes(phoneNumberWithPrefix)) {
          return [...prevPhoneNumbers, phoneNumberWithPrefix];
        }
        return prevPhoneNumbers;
      });
      setNewPhoneNumber('');
    }
  };

  let netSubtotal = billData?.[billData.length - 1]?.subTotal;
  if (billData?.[billData.length - 1]?.discount) {
    netSubtotal -= billData?.[billData.length - 1]?.discount;
  }
  let additionalCharges = 0;
  let otherCharges = {};

  if (zone && zone.zoneType === 'take-away' && Array.isArray(zone.addCharges)) {
    additionalCharges = zone.addCharges.reduce((acc, charge) => {
      let chargeValue = 0;
      if (charge.typeOfValue === 'percentage') {
        chargeValue = (billData?.[billData.length - 1]?.subTotal * charge?.value) / 100;
      } else {
        chargeValue = charge?.value;
      }
      otherCharges[charge.chargeName] = chargeValue;
      return acc + chargeValue;
    }, 0);
  }
  let finalTotal = billData?.[billData.length - 1]?.Total + additionalCharges;
  const openModal = async (modalContent: string) => {
    setFootButton(modalContent);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setFootButton('');
  };

  const handlePaymentMethodSelection = async (methodId) => {
    if (methodId.toLowerCase() === 'dues') {
      toast.error('Please Select different payment method');
    } else if (selectedPaymentMethod === methodId) {
      setSelectedPaymentMethod('');
    } else {
      setSelectedPaymentMethod(methodId);
    }
  };

  const finalClick = async () => {
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
        url: `/v1/kitchens/:kitchenId/settle`,
        data: {
          ...billData[billData.length - 1],
          Total: Math.round(finalTotal),
          otherCharges: otherCharges,
          orderId,
          discount: Math.abs(billData[billData.length - 1]?.discount),
        },
      };

      const res = await axios(config);
      if (res.status) {
        setSelectedPaymentMethod('');
        toast(`Order ${orderId} in ${zoneName} has been successfully settled.`);

        closeModal();
        router.push(routePaths[PAGE_TYPES.TAKE_AWAY](businessId, takeawayId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function getBill() {
    let url = `/v1/kitchens/:id/swiggyBill?businessId=${businessId}&orderId=${orderId}`;

    if (selectedPaymentMethod !== '') {
      url += `&mode=${selectedPaymentMethod}`;
    }

    const response = await axios.get(url);
    const billData = response.data;
    if (!billData) return;
    setBillData(billData);
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(`/v1/payments/Get/Modes?businessId=${businessId}`);
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
    }
  };
  const sendPrintBill = async () => {
    try {
      const url = `/v1/kitchens/:id/swiggyBill?businessId=${businessId}&orderId=${orderId}&userBill=true`;

      const res = await axios.get(url);
      const billId = res.data.billId;
      const config = {
        method: 'GET',
        url: `/v1/kitchens/Get/UserBill/${billId}`,
      };

      if (res.status === 200) {
        const response = await axios(config);
        if (businessData?.kotPrinter) {
          const config2 = {
            method: 'POST',
            url: 'https://ws.hipal.life/bill',
            data: {
              payload: {
                ...response?.data,
                waiterName: userData?.name,
              },
              bill: 'bill',
            },
          };
          const billPrint = axios(config2);
          toast.success('Bill send successfully');
        }
      }
    } catch (error) {
      console.error('Error sending bill:', error);
    }
  };
  const sendBill = async () => {
    try {
      const url = `/v1/kitchens/:id/swiggyBill?businessId=${businessId}&orderId=${orderId}&userBill=true`;

      const res = await axios.get(url);
      const billId = res.data.billId;
      const config = {
        method: 'post',
        url: '/v1/users/Bill/generateBill',
        data: {
          mobiles: selectedPhoneNumbers,
          businessname: businessData?.businessName,
          bill: `https://pro.hipal.life/E-bill/${billId}`,
        },
      };
      if (res.status === 200) {
        const response = await axios(config);
        setSelectedPhoneNumbers([]);
        closeModal();
        toast.success('Bill send sucessfully');
      }
    } catch (error) {
      console.error('Error sending bill:', error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (phone.length <= 8) return phone;
    const start = phone.substring(2, 4);
    const end = phone.substring(phone.length - 3);
    return `${start}XXXXX${end}`;
  };

  useEffect(() => {
    getBill();
  }, [selectedPaymentMethod, orderId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fabRef.current && !fabRef?.current?.contains(event.target)) {
        setIsFabOpen(false);
      }
    };

    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="pb-[7rem]">
      {' '}
      <div className="mx-6">
        <div className="bg-base-100 relative mt-6 w-full rounded-2xl md:mx-auto md:w-1/2 lg:mx-auto">
          {billData[0] && (
            <div className="bg-primary overflow-auto rounded-t-2xl py-4">
              <div className="mx-4 flex justify-between">
                <div className="flex flex-col">
                  <div className="text-base-100 font-[500] capitalize">{billData[0]?.tableName}</div>
                  <div className="text-base-100 mt-1 text-[0.875rem] font-normal capitalize leading-[1rem]">{billData[0]?.customerName}</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-md text-base-100 text-right font-[500]">{billData[0]?.kotTime?.slice(0, 5)}</div>
                  <div className="text-base-100 mt-1 text-[0.875rem] font-normal capitalize leading-[1rem]">{billData[0]?.date}</div>
                </div>
              </div>
            </div>
          )}
          {billData && billData.length > 0 && (
            <>
              <div className="text-base-content mx-4 my-4 flex justify-between font-[500] capitalize">
                <div className="w-[50%]">Items</div>
                <div>Quantity</div>
                <div>Cost</div>
              </div>
              <div className="hide-scrollbar max-h-[40vh] overflow-auto pb-4">
                {billData.slice(0, billData.length - 2).map((bill, index) => (
                  <div
                    key={bill?.id}
                    className={`text-base-content hide-scrollbar mx-4 mt-4 flex justify-between font-[500] capitalize ${
                      index !== billData.length - 3 ? 'border-b border-dashed pb-4' : ''
                    }`}
                  >
                    <div className="w-[60%] font-[500]">
                      {bill?.dish?.name}
                      <div className="text-base-content/40 mt-1 text-[0.875rem] font-normal capitalize leading-[1rem]">
                        {bill?.dish?.portions?.name}
                      </div>
                      <div className="text-base-content/40 mt-1 text-sm font-normal">
                        {bill?.dish?.extras?.map((extra, index) => (
                          <span key={index}>
                            {extra?.quantity} {extra?.name},{' '}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center">{bill?.dish?.qty}</div>
                    <div className="">₹ {bill?.dish?.price}</div>
                  </div>
                ))}
              </div>
              <div className="mx-4 pb-2">
                <hr className="border-gray-500" />
              </div>
            </>
          )}
          {billData?.[billData.length - 1] && (
            <div>
              <BillItem title="Sub-Total" value={billData?.[billData.length - 1]?.subTotal} />

              <BillItem title="Discount" value={billData?.[billData.length - 1]?.discount || 0} />

              {billData?.[billData.length - 1]?.packingCharges > 0 && (
                <BillItem title="Packing Charges" value={billData?.[billData.length - 1]?.packingCharges} />
              )}
              {billData?.[billData.length - 1]?.RxPayableGST > 0 && (
                <BillItem title="RxPayable GST" value={billData?.[billData.length - 1]?.RxPayableGST} />
              )}
              {billData?.[billData.length - 1]?.swiggyPayableGST > 0 && (
                <BillItem title="Swiggy Payable GST" value={billData?.[billData.length - 1]?.swiggyPayableGST} />
              )}
              {zone &&
                zone.zoneType === 'take-away' &&
                zone.addCharges.map((charge, index) => (
                  <BillItem
                    key={index}
                    title={charge.chargeName}
                    value={charge.typeOfValue === 'percentage' ? (billData?.[billData.length - 1]?.subTotal * charge.value) / 100 : charge.value}
                  />
                ))}
              <div className="text-base-content mx-4 mt-2 flex justify-between pb-4 font-[600] capitalize">
                <div>Total</div>
                <div>₹ {Math.round(finalTotal)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        {footButton.toLowerCase() === 'settle' && (
          <div className="relative min-h-[70vh]">
            <div className="mt-4 flex justify-between">
              <div className="text-base-content ml-6 font-[500] capitalize">Payment Mode</div>
              <div className="text-base-content mr-[1.5rem] font-[500] capitalize">₹ {Math.round(finalTotal)}</div>
            </div>
            <div className="mx-6 mt-4 max-h-[70vh] space-y-4 overflow-y-auto pb-[7rem]">
              {paymentMethods
                .filter((method) => method?.mode !== 'dues' && method?.mode !== 'split payment' && method?.mode !== 'complimentary')
                .map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-xl border py-2 pr-4"
                    onClick={() => handlePaymentMethodSelection(method?.mode)}
                  >
                    <label htmlFor={`method-${method.id}`} className="ml-4 line-clamp-1 font-medium capitalize">
                      ₹ {method?.mode}
                    </label>
                    <input
                      id={`method-${method.id}`}
                      type="checkbox"
                      value="0"
                      checked={selectedPaymentMethod === method?.mode}
                      onChange={() => handlePaymentMethodSelection(method?.mode)}
                    />
                  </div>
                ))}
            </div>

            <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
              <button className="text-base-100 bg-primary absolute bottom-3 left-2  rounded-full px-4 py-2 text-base font-[500]">
                ₹ Payment Modes
              </button>
              <button
                onClick={finalClick}
                className={`border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500] ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
        {footButton.toLowerCase() === 'printbill' && (
          <div className="relative mx-6 mt-6 pb-12">
            <div className="font-semibold">Print bill</div>
            <p className="text-sm opacity-70">Do you want print bill?</p>
            <button
              onClick={() => {
                sendPrintBill();
                closeModal();
              }}
              className="border-base-100 bg-primary text-base-100 absolute bottom-6 right-0 z-50 mr-2 rounded-full border px-6 py-2 text-sm font-[500]"
            >
              Print
            </button>
          </div>
        )}
        {footButton.toLowerCase() === 'ebill' && (
          <div className="relative max-h-[70vh] min-h-[70vh] overflow-auto">
            <div className="flex justify-between">
              <div className="text-base-content ml-6 mt-4 font-[500] capitalize">E-Bill</div>
              <div className="text-base-content mr-6 mt-3 font-[500] capitalize">₹ {billData[billData.length - 1]?.Total}</div>
            </div>
            <div className="ml-6 mt-4">
              <div className="mr-6 flex">
                <div className="bg-primary border-primary text-base-100 rounded-l-full border px-3">+91</div>
                <input
                  type="number"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  maxLength={10}
                  minLength={10}
                  placeholder="Enter Phone Number"
                  className="border-b-primary w-full border-b pl-2 focus:outline-none"
                />
                <button onClick={handleAddPhoneNumber} className="text-primary border-primary rounded-lg border px-2">
                  Add
                </button>
              </div>
              <div className="text-primary text-medium my-2">Sent to</div>

              <div className="overflow-auto pb-[5rem]">
                <div className="text-primary text-medium mt-4">Selected Numbers</div>
                {selectedPhoneNumbers.map((phone, i) => (
                  <div key={i} className="">
                    {formatPhoneNumber(phone)}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary shadow-base-100 fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg">
              <button className="text-base-100 bg-primary absolute bottom-3 left-6 mr-2  rounded-full px-4 py-2 text-base font-[500]">₹ Bill</button>
              <button
                onClick={sendBill}
                className="border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 z-50 mr-2 rounded-full border px-4 py-2 text-sm font-[500]"
              >
                send
              </button>
            </div>
          </div>
        )}
      </DayOutPopup>
      <div
        className={`${
          activeButton.toLowerCase() === 'settle' && billData.length > 0 ? '' : 'hidden'
        } shadow-base-100 bg-primary fixed bottom-0 z-20 h-[4rem] w-full py-2 shadow-lg`}
      >
        <div ref={fabRef} className="absolute bottom-[5rem] left-6">
          <div
            className={`flex origin-bottom transform flex-col space-y-2 ${
              isFabOpen ? 'scale-y-1 opacity-100' : 'scale-y-0 opacity-0'
            } fab-transition`}
          >
            <button
              onClick={() => openModal('printbill')}
              className="text-base-100 bg-primary flex items-center justify-center rounded-xl px-4 py-2 text-sm shadow-lg"
            >
              <ImPrinter className="mr-2" /> Print Bill
            </button>
            <button
              onClick={() => openModal('ebill')}
              className="text-base-100 flex items-center justify-center rounded-xl bg-green-400 px-4 py-2 text-sm shadow-lg"
            >
              <MdOutlineReceiptLong className="mr-2" /> E-Bill
            </button>
          </div>
          <button onClick={toggleFab} className="text-base-100 bg-primary mt-2 flex h-12 w-12 items-center justify-center rounded-full shadow-lg">
            {isFabOpen ? <HiX className="text-2xl" /> : <BiPlus className="text-3xl" />}
          </button>
        </div>
        <button
          onClick={() => {
            fetchPaymentMethods();
            openModal('settle');
          }}
          className={`${
            billData.length > 0
              ? 'border-base-100 text-primary bg-base-100 absolute bottom-3 right-6 mr-2 rounded-full border px-4 py-2 text-sm font-[500]'
              : 'hidden'
          }`}
        >
          Settle
        </button>
      </div>
    </div>
  );
};

export default TakeAwaySettle;
