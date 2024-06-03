//@ts-check
import DayOutPopup from "@/components/atoms/dayoutPopup";
import { useBillStore } from "@/components/store/useBillStore";
import useDiscountStore from "@/components/store/useDiscountStore";
import { useLogin } from "@/components/store/useLogin";
import { useZoneStore } from "@/components/store/useZone";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import axios from "@/axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { MdOutlineReceiptLong } from "react-icons/md";
import { ImPrinter } from "react-icons/im";
import { HiX } from "react-icons/hi";
import { BiPlus } from "react-icons/bi";
import { useBusinessStore } from "@/components/store/useBusinessData";
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
  <div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
    <div>{title}</div>
    <div>₹ {value}</div>
  </div>
);

const TakeAwaySettle: React.FC<POSProps> = ({ activeButton }) => {
  const { billData, setBillData } = useBillStore();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [footButton, setFootButton] = useState("");
  const { businessData } = useBusinessStore();
  const userData = useLogin((s) => s.userDetails);
  const zone = useZoneStore((s) => s.zone);
  const { selectedPaymentMethod, setSelectedPaymentMethod } =
    useDiscountStore();
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
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [selectedPhoneNumbers, setSelectedPhoneNumbers] = useState<any>([]);
  const toggleFab = () => {
    setIsFabOpen(!isFabOpen);
  };
  const handleAddPhoneNumber = () => {
    if (newPhoneNumber) {
      const phoneNumberWithPrefix = "91" + newPhoneNumber;
      setSelectedPhoneNumbers((prevPhoneNumbers) => {
        if (!prevPhoneNumbers.includes(phoneNumberWithPrefix)) {
          return [...prevPhoneNumbers, phoneNumberWithPrefix];
        }
        return prevPhoneNumbers;
      });
      setNewPhoneNumber("");
    }
  };

  let netSubtotal = billData?.[billData.length - 1]?.subTotal;
  if (billData?.[billData.length - 1]?.discount) {
    netSubtotal -= billData?.[billData.length - 1]?.discount;
  }
  let additionalCharges = 0;
  let otherCharges = {};

  if (zone && zone.zoneType === "take-away" && Array.isArray(zone.addCharges)) {
    additionalCharges = zone.addCharges.reduce((acc, charge) => {
      let chargeValue = 0;
      if (charge.typeOfValue === "percentage") {
        chargeValue =
          (billData?.[billData.length - 1]?.subTotal * charge?.value) / 100;
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
    setFootButton("");
  };

  const handlePaymentMethodSelection = async (methodId) => {
    if (methodId.toLowerCase() === "dues") {
      toast.error("Please Select different payment method");
    } else if (selectedPaymentMethod === methodId) {
      setSelectedPaymentMethod("");
    } else {
      setSelectedPaymentMethod(methodId);
    }
  };

  const finalClick = async () => {
    if (!selectedPaymentMethod) {
      return toast.error("Please Select the Mode");
    }
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const config = {
        method: "put",
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
        setSelectedPaymentMethod("");
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

    if (selectedPaymentMethod !== "") {
      url += `&mode=${selectedPaymentMethod}`;
    }

    const response = await axios.get(url);
    const billData = response.data;
    if (!billData) return;
    setBillData(billData);
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await axios.get(
        `/v1/payments/Get/Modes?businessId=${businessId}`
      );
      setPaymentMethods(response.data);
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
    }
  };
  const sendPrintBill = async () => {
    try {
      const url = `/v1/kitchens/:id/swiggyBill?businessId=${businessId}&orderId=${orderId}&userBill=true`;
  

      const res = await axios.get(url);
      const billId = res.data.billId;
      const config = {
        method: "GET",
        url: `/v1/kitchens/Get/UserBill/${billId}`,
      };

      if (res.status === 200) {
        const response = await axios(config);
        if (businessData?.kotPrinter) {
          const config2 = {
            method: "POST",
            url: "https://ws.hipal.life/bill",
            data: {
              payload: {
                ...response?.data,
                waiterName: userData?.name,
              },
              bill: "bill",
            },
          };
          const billPrint = axios(config2);
            toast.success("Bill send successfully");
        }
      }
    } catch (error) {
      console.error("Error sending bill:", error);
    }
  };
  const sendBill = async () => {
    try {
      const url = `/v1/kitchens/:id/swiggyBill?businessId=${businessId}&orderId=${orderId}&userBill=true`;

      const res = await axios.get(url);
      const billId = res.data.billId;
      const config = {
        method: "post",
        url: "/v1/users/Bill/generateBill",
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
        toast.success("Bill send sucessfully");
      }
    } catch (error) {
      console.error("Error sending bill:", error);
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

    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div className="pb-[7rem]">
      {" "}
      <div className="mx-6">
        <div className="relative w-full mt-6 md:w-1/2 lg:mx-auto md:mx-auto bg-base-100 rounded-2xl">
          {billData[0] && (
            <div className="py-4 overflow-auto bg-primary rounded-t-2xl">
              <div className="flex justify-between mx-4">
                <div className="flex flex-col">
                  <div className="font-[500] text-base-100 capitalize">
                    {billData[0]?.tableName}
                  </div>
                  <div className="capitalize font-normal text-base-100 text-[0.875rem] mt-1 leading-[1rem]">
                    {billData[0]?.customerName}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-right text-md font-[500] text-base-100">
                    {billData[0]?.kotTime?.slice(0, 5)}
                  </div>
                  <div className="capitalize font-normal mt-1 text-base-100 text-[0.875rem] leading-[1rem]">
                    {billData[0]?.date}
                  </div>
                </div>
              </div>
            </div>
          )}
          {billData && billData.length > 0 && (
            <>
              <div className="flex justify-between capitalize font-[500] mx-4 my-4 text-base-content">
                <div className="w-[50%]">Items</div>
                <div>Quantity</div>
                <div>Cost</div>
              </div>
              <div className="overflow-auto max-h-[40vh] pb-4 hide-scrollbar">
                {billData.slice(0, billData.length - 2).map((bill, index) => (
                  <div
                    key={bill?.id}
                    className={`flex justify-between capitalize font-[500] mx-4 mt-4 text-base-content hide-scrollbar ${
                      index !== billData.length - 3
                        ? "pb-4 border-b border-dashed"
                        : ""
                    }`}
                  >
                    <div className="w-[60%] font-[500]">
                      {bill?.dish?.name}
                      <div className="capitalize font-normal text-base-content/40 text-[0.875rem] mt-1 leading-[1rem]">
                        {bill?.dish?.portions?.name}
                      </div>
                      <div className="mt-1 text-sm font-normal text-base-content/40">
                        {bill?.dish?.extras?.map((extra, index) => (
                          <span key={index}>
                            {extra?.quantity} {extra?.name},{" "}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center">{bill?.dish?.qty}</div>
                    <div className="">₹ {bill?.dish?.price}</div>
                  </div>
                ))}
              </div>
              <div className="pb-2 mx-4">
                <hr className="border-gray-500" />
              </div>
            </>
          )}
          {billData?.[billData.length - 1] && (
            <div>
              <BillItem
                title="Sub-Total"
                value={billData?.[billData.length - 1]?.subTotal}
              />

              <BillItem
                title="Discount"
                value={billData?.[billData.length - 1]?.discount ||0}
              />

              {billData?.[billData.length - 1]?.packingCharges > 0 && (
                <BillItem
                  title="Packing Charges"
                  value={billData?.[billData.length - 1]?.packingCharges}
                />
              )}
              {billData?.[billData.length - 1]?.RxPayableGST > 0 && (
                <BillItem
                  title="RxPayable GST"
                  value={billData?.[billData.length - 1]?.RxPayableGST}
                />
              )}
              {billData?.[billData.length - 1]?.swiggyPayableGST > 0 && (
                <BillItem
                  title="Swiggy Payable GST"
                  value={billData?.[billData.length - 1]?.swiggyPayableGST}
                />
              )}
              {zone &&
                zone.zoneType === "take-away" &&
                zone.addCharges.map((charge, index) => (
                  <BillItem
                    key={index}
                    title={charge.chargeName}
                    value={
                      charge.typeOfValue === "percentage"
                        ? (billData?.[billData.length - 1]?.subTotal *
                            charge.value) /
                          100
                        : charge.value
                    }
                  />
                ))}
              <div className="flex justify-between pb-4 mx-4 mt-2 capitalize font-[600] text-base-content">
                <div>Total</div>
                <div>₹ {Math.round(finalTotal)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DayOutPopup show={isModalOpen} onClose={closeModal}>
        {footButton.toLowerCase() === "settle" && (
          <div className="relative min-h-[70vh]">
            <div className="flex justify-between mt-4">
              <div className="capitalize font-[500] ml-6 text-base-content">
                Payment Mode
              </div>
              <div className="capitalize font-[500] mr-[1.5rem] text-base-content">
                ₹ {Math.round(finalTotal)}
              </div>
            </div>
            <div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh] pb-[7rem]">
              {paymentMethods
                .filter(
                  (method) =>
                    method?.mode !== "dues" &&
                    method?.mode !== "split payment" &&
                    method?.mode !== "complimentary"
                )
                .map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between py-2 pr-4 border rounded-xl"
                    onClick={() => handlePaymentMethodSelection(method?.mode)}
                  >
                    <label
                      htmlFor={`method-${method.id}`}
                      className="ml-4 font-medium capitalize line-clamp-1"
                    >
                      ₹ {method?.mode}
                    </label>
                    <input
                      id={`method-${method.id}`}
                      type="checkbox"
                      value="0"
                      checked={selectedPaymentMethod === method?.mode}
                      onChange={() =>
                        handlePaymentMethodSelection(method?.mode)
                      }
                    />
                  </div>
                ))}
            </div>

            <div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
              <button className="absolute px-4 text-base py-2 font-[500]  text-base-100 bg-primary rounded-full bottom-3 left-2">
                ₹ Payment Modes
              </button>
              <button
                onClick={finalClick}
                className={`absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Loading..." : "Continue"}
              </button>
            </div>
          </div>
        )}
        {footButton.toLowerCase() === "printbill" && (
            <div className="relative pb-12 mx-6 mt-6">
              <div className="font-semibold">Print bill</div>
              <p className="text-sm opacity-70">Do you want print bill?</p>
              <button
                onClick={() => {
                  sendPrintBill();
                  closeModal();
                }}
                className="absolute z-50 text-sm font-[500] px-6 py-2 mr-2 border-base-100 border bg-primary text-base-100 rounded-full right-0 bottom-6"
              >
                Print
              </button>
            </div>
          )}
          {footButton.toLowerCase() === "ebill" && (
            <div className="relative min-h-[70vh] max-h-[70vh] overflow-auto">
              <div className="flex justify-between">
                <div className="capitalize font-[500] ml-6 mt-4 text-base-content">
                  E-Bill
                </div>
                <div className="capitalize font-[500] mr-6 mt-3 text-base-content">
                  ₹ {billData[billData.length - 1]?.Total}
                </div>
              </div>
              <div className="mt-4 ml-6">
                <div className="flex mr-6">
                  <div className="px-3 border rounded-l-full bg-primary border-primary text-base-100">
                    +91
                  </div>
                  <input
                    type="number"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    maxLength={10}
                    minLength={10}
                    placeholder="Enter Phone Number"
                    className="w-full pl-2 border-b border-b-primary focus:outline-none"
                  />
                  <button
                    onClick={handleAddPhoneNumber}
                    className="px-2 border rounded-lg text-primary border-primary"
                  >
                    Add
                  </button>
                </div>
                <div className="my-2 text-primary text-medium">Sent to</div>
              

                <div className="pb-[5rem] overflow-auto">
                  <div className="mt-4 text-primary text-medium">
                    Selected Numbers
                  </div>
                  {selectedPhoneNumbers.map((phone, i) => (
                    <div key={i} className="">
                      {formatPhoneNumber(phone)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
                <button className="absolute px-4 text-base py-2 mr-2 font-[500]  text-base-100 bg-primary rounded-full bottom-3 left-6">
                  ₹ Bill
                </button>
                <button
                  onClick={sendBill}
                  className="absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3"
                >
                  send
                </button>
              </div>
            </div>
          )}
      </DayOutPopup>
      <div
        className={`${
          activeButton.toLowerCase() === "settle" && billData.length > 0
            ? ""
            : "hidden"
        } w-full h-[4rem] fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100 bg-primary`}
      >
        <div ref={fabRef} className="absolute bottom-[5rem] left-6">
          <div
            className={`flex flex-col space-y-2 transform origin-bottom ${
              isFabOpen ? "opacity-100 scale-y-1" : "opacity-0 scale-y-0"
            } fab-transition`}
          >
            <button
              onClick={() => openModal("printbill")}
              className="flex items-center justify-center px-4 py-2 text-sm shadow-lg text-base-100 bg-primary rounded-xl"
            >
              <ImPrinter className="mr-2" /> Print Bill
            </button>
            <button
              onClick={() => openModal("ebill")}
              className="flex items-center justify-center px-4 py-2 text-sm bg-green-400 shadow-lg text-base-100 rounded-xl"
            >
              <MdOutlineReceiptLong className="mr-2" /> E-Bill
            </button>
          </div>
          <button
            onClick={toggleFab}
            className="flex items-center justify-center w-12 h-12 mt-2 rounded-full shadow-lg text-base-100 bg-primary"
          >
            {isFabOpen ? (
              <HiX className="text-2xl" />
            ) : (
              <BiPlus className="text-3xl" />
            )}
          </button>
        </div>
        <button
          onClick={() => {
            fetchPaymentMethods();
            openModal("settle");
          }}
          className={`${
            billData.length > 0
              ? "absolute text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3"
              : "hidden"
          }`}
        >
          Settle
        </button>
      </div>
    </div>
  );
};

export default TakeAwaySettle;