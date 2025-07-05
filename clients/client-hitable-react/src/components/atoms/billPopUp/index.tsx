import { lazy, memo, useCallback, useState } from "react";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import {
  cn,
  timestampToDateTime,
  useErrorHandling,
} from "@/components/utils/helpers";
import { apiRpc } from "@hi/common";
import { FiCopy } from "react-icons/fi";
import { MdOutlineCall } from "react-icons/md";
import {
  User,
  Receipt,
  CreditCard,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import NormalSettle from "../placeOrders/normalsettle";
import { NavItemTypesEnum } from "@/components/types/hiClientzData";

const BottomPopUp = lazy(() => import("../universalPopup"));

const BillPopUpMemo = () => {
  const { errorText } = useErrorHandling();
  const { selectedNavItem, viewData, removeOfflineAlert } = useLiteStore(
    (s) => ({
      selectedNavItem: s.selectedNavItem,
      viewData: s.viewData,
      removeOfflineAlert: s.removeOfflineAlert,
    }),
  );

  const [textTick, setTextTick] = useState(false);
  const [numberTick, setNumberTick] = useState(false);
  const clickViewMore = useLiteStore((s) => s.clickViewMore);
  const setClickViewMore = useLiteStore((s) => s.setClickViewMore);
  const captainData = useHiClientZ((s) => s.captainData);
  const [normalSettle, setNormalSettle] = useState<boolean>(false);

  const copyText = useCallback((id: string, value?: string) => {
    let text: string;
    if (value) {
      text = value;
    } else {
      text = document.querySelector(id)?.textContent || "";
    }
    const sanitizedText = text.replace(/[₹]/g, "");
    navigator.clipboard
      .writeText(sanitizedText)
      .then(() => {
        if (value) {
          setNumberTick(true);
          setTimeout(() => {
            setNumberTick(false);
          }, 3000);
        } else {
          setTextTick(true);
          setTimeout(() => {
            setTextTick(false);
          }, 3000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }, []);

  const handleCloseAlert = async (id: string) => {
    const res = await apiRpc.payments[":pid"].rejectOrder[":alertId"].$put({
      json: {
        waiterName: captainData?.name,
      },
      param: { alertId: id },
    });
    if (res.status === 401) {
      return errorText();
    }
    toast.success("order reject successfully");
    setClickViewMore(false);
    removeOfflineAlert(id);
  };

  const handleCloseOnline = useCallback(() => {
    setClickViewMore(false);
  }, [setClickViewMore]);

  const hideMiddleNumbers = useCallback((phone: string) => {
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  }, []);

  const handleAccept = () => {
    setNormalSettle(true);
  };

  const closeNormalSettle = () => {
    setNormalSettle(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType?.toUpperCase()) {
      case "NORMAL_SETTLE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OFFLINE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate totals and discounts
  const orderData = viewData?.order_id;
  const totalDiscounts =
    (orderData?.discount || 0) +
    (orderData?.couponDiscount || 0) +
    (orderData?.claimedCoins || 0);
  const gstAmount = orderData?.gst || 0;

  return (
    <BottomPopUp
      height="h-[85dvh]"
      show={clickViewMore}
      onClose={handleCloseOnline}
    >
      {normalSettle ? (
        <NormalSettle
          closeNormalSettle={closeNormalSettle}
          data={{ total: Number(orderData?.total) }}
          alertData={viewData}
        />
      ) : (
        <section
          className="hide-scrollbar"
          style={{ maxHeight: "90%", overflowY: "auto" }}
        >
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Transaction Details
                </h1>
                <p className="text-sm text-gray-500">
                  {timestampToDateTime(viewData?.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  ID: {viewData?._id?.slice(-6)}
                </p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      viewData?.status,
                    )}`}
                  >
                    {viewData?.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertTypeColor(
                      viewData?.alertType,
                    )}`}
                  >
                    {viewData?.alertType?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="mx-4 my-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Bill Value</p>
                <p className="text-2xl font-bold">₹{orderData?.billValue}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Amount Paid</p>
                <p className="text-xl font-semibold">₹{orderData?.total}</p>
              </div>
            </div>
            {totalDiscounts > 0 && (
              <div className="mt-2 pt-2 border-t border-green-400/30">
                <p className="text-xs opacity-75">
                  Total Savings: ₹{totalDiscounts}
                </p>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{viewData?.userId?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Phone:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {hideMiddleNumbers(viewData?.userId?.phone || "")}
                  </span>
                  <button
                  type="button"
                    className={cn(
                      "p-1 rounded text-xs",
                      numberTick
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600",
                    )}
                    onClick={() => copyText("#phone", viewData?.userId?.phone)}
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                  <a
                    href={`tel:+91${viewData?.userId?.phone}`}
                    className="p-1 rounded bg-blue-100 text-blue-600"
                  >
                    <MdOutlineCall className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium">
                  {viewData?.tableName || orderData?.tableName}
                </span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Receipt className="w-4 h-4" />
              Order Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-xs">
                  {orderData?.order_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt:</span>
                <span className="font-medium text-xs">
                  {orderData?.receipt}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{orderData?.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashback Available:</span>
                <span
                  className={`font-medium ${
                    orderData?.cashbackAvailable
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {orderData?.cashbackAvailable ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium text-xs">
                  {timestampToDateTime(orderData?.date)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <CreditCard className="w-4 h-4" />
              Payment Breakdown
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Bill Value:</span>
                <span className="font-medium">₹{orderData?.billValue}</span>
              </div>

              {gstAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">GST:</span>
                  <span className="font-medium">₹{gstAmount}</span>
                </div>
              )}

              {orderData?.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">General Discount:</span>
                  <span className="font-medium text-orange-600">
                    -₹{orderData.discount}
                  </span>
                </div>
              )}

              {orderData?.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon Discount:</span>
                  <span className="font-medium text-orange-600">
                    -₹{orderData.couponDiscount}
                  </span>
                </div>
              )}

              {orderData?.claimedCoins > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Loyalty Coins:</span>
                  <span className="font-medium text-orange-600">
                    -{orderData.claimedCoins}
                  </span>
                </div>
              )}

              {orderData?.tips > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tips:</span>
                  <span className="font-medium">₹{orderData.tips}</span>
                </div>
              )}

              {viewData?.posDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">POS Discount:</span>
                  <span className="font-medium text-orange-600">
                    -₹{viewData.posDiscount}
                  </span>
                </div>
              )}

              <hr className="my-2" />
              <div className="flex justify-between bg-green-50 p-2 rounded">
                <span className="font-semibold text-green-800">
                  Final Amount:
                </span>
                <span className="font-bold text-green-800">
                  ₹{orderData?.total}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
              <Clock className="w-4 h-4" />
              Transaction Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium text-xs">{viewData?._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium capitalize">{viewData?.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waiter:</span>
                <span className="font-medium">
                  {viewData?.waiterName || "Not assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coins Applied:</span>
                <span
                  className={`font-medium ${
                    viewData?.coinsApplied ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {viewData?.coinsApplied ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Accepted:</span>
                <div className="flex items-center gap-1">
                  {viewData?.isAccepted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      viewData?.isAccepted ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {viewData?.isAccepted ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rejected:</span>
                <div className="flex items-center gap-1">
                  {viewData?.isRejected ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <span
                    className={`font-medium ${
                      viewData?.isRejected ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {viewData?.isRejected ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              {viewData?.billId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill ID:</span>
                  <span className="font-medium text-xs">{viewData.billId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message & Comments */}
          {(viewData?.message ||
            viewData?.comment ||
            viewData?.errorReason ||
            viewData?.errorDescription) && (
            <div className="mx-4 mb-4 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-3">
                <MessageSquare className="w-4 h-4" />
                Messages & Comments
              </h3>
              <div className="space-y-2">
                {viewData?.message && (
                  <div>
                    <span className="text-gray-600 text-sm">Message:</span>
                    <p className="font-medium">{viewData.message}</p>
                  </div>
                )}
                {viewData?.comment && (
                  <div>
                    <span className="text-gray-600 text-sm">Comment:</span>
                    <p className="font-medium">{viewData.comment}</p>
                  </div>
                )}
                {viewData?.errorReason && (
                  <div>
                    <span className="text-red-600 text-sm">Error Reason:</span>
                    <p className="font-medium text-red-600">
                      {viewData.errorReason}
                    </p>
                  </div>
                )}
                {viewData?.errorDescription && (
                  <div>
                    <span className="text-red-600 text-sm">
                      Error Description:
                    </span>
                    <p className="font-medium text-red-600">
                      {viewData.errorDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Copy Summary Section */}
          <div className="mx-4 mb-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div id="transaction-summary" className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Transaction Summary:</strong>
              </p>
              <p className="text-sm">
                Customer: <strong>{viewData?.userId?.name}</strong> (
                {viewData?.userId?.phone})
              </p>
              <p className="text-sm">
                Transaction ID: <strong>{viewData?._id}</strong>
              </p>
              <p className="text-sm">
                Order ID: <strong>{orderData?.order_id}</strong>
              </p>
              <p className="text-sm">
                Table: <strong>{viewData?.tableName}</strong>
              </p>
              <p className="text-sm">
                Bill Value: <strong>₹{orderData?.billValue}</strong>
              </p>
              {gstAmount > 0 && (
                <p className="text-sm">
                  GST: <strong>₹{gstAmount}</strong>
                </p>
              )}
              {totalDiscounts > 0 && (
                <p className="text-sm">
                  Total Discounts: <strong>₹{totalDiscounts}</strong>
                </p>
              )}
              <p className="text-sm">
                Final Amount: <strong>₹{orderData?.total}</strong>
              </p>
              <p className="text-sm">
                Payment Mode: <strong>{viewData?.mode}</strong>
              </p>
              <p className="text-sm">
                Status: <strong>{viewData?.status}</strong>
              </p>
              <p className="text-sm">
                Date: <strong>{timestampToDateTime(viewData?.date)}</strong>
              </p>

              {viewData?.posDiscount > 0 && (
                <p className="text-base font-bold text-black mt-3">
                  POS Discount Applied: <strong>₹{viewData.posDiscount}</strong>
                </p>
              )}
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  textTick
                    ? "bg-green-100 text-green-600"
                    : "bg-purple-100 text-purple-600",
                )}
                onClick={() => copyText("#transaction-summary")}
              >
                {textTick ? "Copied!" : "Copy Summary"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          {viewData?.alertType !== "OFFLINE" ||
          selectedNavItem === NavItemTypesEnum.HISTORY ? (
            <div className="flex justify-center mb-5">
              <button
                type="button"
                onClick={handleCloseOnline}
                className="fixed bottom-4 z-50 w-[20.5rem] rounded-full bg-black py-3 text-lg text-white font-medium"
              >
                Close Alert
              </button>
            </div>
          ) : (
            <div className="fixed bottom-0 z-20 w-full max-w-[48rem] bg-white border-t border-gray-200 p-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleCloseAlert(viewData?._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </BottomPopUp>
  );
};

const BillPopUp = memo(BillPopUpMemo);
export default BillPopUp;
