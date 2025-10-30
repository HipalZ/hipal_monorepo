import type { Alert } from '@/components/types/hiClientzData.ts';
import { timestampToDateTime } from '@/components/utils/helpers.ts';
import { cn } from '@/lib/utils.ts';
import { CheckCircle, Clock, CreditCard, MessageSquare, Receipt, User, XCircle } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { FiCopy } from 'react-icons/fi';
import { MdOutlineCall } from 'react-icons/md';
import PasswordModal from '../cartItem/PasswordModal.tsx';

interface BillPopupDataProps {
  viewData: Alert;
}

const MemoBillPopupData = ({ viewData }: BillPopupDataProps) => {
  const [textTick, setTextTick] = useState(false);
  const [numberTick, setNumberTick] = useState(false);

  // Password protection states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [pendingAction, setPendingAction] = useState<'copy' | 'call' | null>(null);

  const copyText = useCallback((id: string, value?: string) => {
    let text: string;
    if (value) {
      text = value;
    } else {
      text = document.querySelector(id)?.textContent || '';
    }
    const sanitizedText = text.replace(/[₹]/g, '');
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
        console.error('Failed to copy text: ', err);
      });
  }, []);

  const hideMiddleNumbers = useCallback((phone: string) => {
    if (phone.length <= 2) return phone;
    const firstPart = phone.slice(0, 2);
    const lastPart = phone.slice(-1);
    return `${firstPart}****${lastPart}`;
  }, []);

  // Password protection handlers
  const handleProtectedAction = useCallback(
    (action: 'copy' | 'call') => {
      if (isPhoneVerified) {
        executePhoneAction(action);
      } else {
        setPendingAction(action);
        setIsModalOpen(true);
      }
    },
    [isPhoneVerified],
  );

  const executePhoneAction = useCallback(
    (action: 'copy' | 'call') => {
      const phone = viewData?.userId?.phone;
      if (!phone) return;

      if (action === 'copy') {
        copyText('', phone);
      } else if (action === 'call') {
        window.location.href = `tel:+91${phone}`;
      }
    },
    [viewData?.userId?.phone, copyText],
  );

  const handlePasswordVerify = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setIsPhoneVerified(true);
        if (pendingAction) {
          executePhoneAction(pendingAction);
          setPendingAction(null);
        }
        // Auto-lock after 5 minutes for security
        setTimeout(() => setIsPhoneVerified(false), 5 * 60 * 1000);
      }
    },
    [pendingAction, executePhoneAction],
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType?.toUpperCase()) {
      case 'NORMAL_SETTLE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OFFLINE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const orderData = viewData?.order_id;
  const totalDiscounts = (orderData?.discount || 0) + (orderData?.couponDiscount || 0) + (orderData?.claimedCoins || 0);
  const gstAmount = orderData?.gst || 0;

  return (
    <div>
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Transaction Details</h1>
            <p className="text-sm text-gray-500">{timestampToDateTime(viewData?.date)}</p>
          </div>
          <div className="mt-6 text-right">
            <p className="text-xs text-gray-500">ID: {viewData?._id?.slice(-6)}</p>
            <div className="mt-1 flex gap-2">
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(viewData?.status)}`}>{viewData?.status}</span>
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getAlertTypeColor(viewData?.alertType)}`}>
                {viewData?.alertType?.replace('_', ' ')}
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
          <div className="mt-2 border-t border-green-400/30 pt-2">
            <p className="text-xs opacity-75">Total Savings: ₹{totalDiscounts}</p>
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <User className="h-4 w-4" />
          Customer Information
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{viewData?.userId?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Phone:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{isPhoneVerified ? viewData?.userId?.phone : hideMiddleNumbers(viewData?.userId?.phone || '')}</span>
              <button
                type="button"
                className={cn('rounded p-1 text-xs', numberTick ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600')}
                onClick={() => handleProtectedAction('copy')}
              >
                <FiCopy className="h-3 w-3" />
              </button>
              <button type="button" className="rounded bg-blue-100 p-1 text-blue-600" onClick={() => handleProtectedAction('call')}>
                <MdOutlineCall className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Table:</span>
            <span className="font-medium">{viewData?.tableName || orderData?.tableName}</span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Receipt className="h-4 w-4" />
          Order Details
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="text-xs font-medium">{orderData?.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Receipt:</span>
            <span className="text-xs font-medium">{orderData?.receipt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="font-medium">{orderData?.currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cashback Available:</span>
            <span className={`font-medium ${orderData?.cashbackAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {orderData?.cashbackAvailable ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="text-xs font-medium">{timestampToDateTime(orderData?.date)}</span>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <CreditCard className="h-4 w-4" />
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
              <span className="font-medium text-orange-600">-₹{orderData.discount}</span>
            </div>
          )}
          {orderData?.couponDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Coupon Discount:</span>
              <span className="font-medium text-orange-600">-₹{orderData.couponDiscount}</span>
            </div>
          )}
          {orderData?.claimedCoins > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Loyalty Coins:</span>
              <span className="font-medium text-orange-600">-{orderData.claimedCoins}</span>
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
              <span className="font-medium text-orange-600">-₹{viewData.posDiscount}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between rounded bg-green-50 p-2">
            <span className="font-semibold text-green-800">Final Amount:</span>
            <span className="font-bold text-green-800">₹{orderData?.total}</span>
          </div>
        </div>
      </div>

      {/* Transaction Information */}
      <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
          <Clock className="h-4 w-4" />
          Transaction Information
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Transaction ID:</span>
            <span className="text-xs font-medium">{viewData?._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Mode:</span>
            <span className="font-medium capitalize">{viewData?.mode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Waiter:</span>
            <span className="font-medium">{viewData?.waiterName || 'Not assigned'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Coins Applied:</span>
            <span className={`font-medium ${viewData?.coinsApplied ? 'text-green-600' : 'text-red-600'}`}>
              {viewData?.coinsApplied ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accepted:</span>
            <div className="flex items-center gap-1">
              {viewData?.isAccepted ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
              <span className={`font-medium ${viewData?.isAccepted ? 'text-green-600' : 'text-red-600'}`}>{viewData?.isAccepted ? 'Yes' : 'No'}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rejected:</span>
            <div className="flex items-center gap-1">
              {viewData?.isRejected ? <XCircle className="h-4 w-4 text-red-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
              <span className={`font-medium ${viewData?.isRejected ? 'text-red-600' : 'text-green-600'}`}>{viewData?.isRejected ? 'Yes' : 'No'}</span>
            </div>
          </div>
          {viewData?.billId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Bill ID:</span>
              <span className="text-xs font-medium">{viewData.billId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message & Comments */}
      {(viewData?.message || viewData?.comment || viewData?.errorReason || viewData?.errorDescription) && (
        <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
            <MessageSquare className="h-4 w-4" />
            Messages & Comments
          </h3>
          <div className="space-y-2">
            {viewData?.message && (
              <div>
                <span className="text-sm text-gray-600">Message:</span>
                <p className="font-medium">{viewData.message}</p>
              </div>
            )}
            {viewData?.comment && (
              <div>
                <span className="text-sm text-gray-600">Comment:</span>
                <p className="font-medium">{viewData.comment}</p>
              </div>
            )}
            {viewData?.errorReason && (
              <div>
                <span className="text-sm text-red-600">Error Reason:</span>
                <p className="font-medium text-red-600">{viewData.errorReason}</p>
              </div>
            )}
            {viewData?.errorDescription && (
              <div>
                <span className="text-sm text-red-600">Error Description:</span>
                <p className="font-medium text-red-600">{viewData.errorDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copy Summary Section */}
      <div className="mx-4 mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div id="transaction-summary" className="space-y-2">
          <p className="text-sm text-gray-600">
            <strong>Transaction Summary:</strong>
          </p>
          <p className="text-sm">
            Customer: <strong>{viewData?.userId?.name}</strong> (
            {isPhoneVerified ? viewData?.userId?.phone : hideMiddleNumbers(viewData?.userId?.phone || '')})
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
            <p className="mt-3 text-base font-bold text-black">
              POS Discount Applied: <strong>₹{viewData.posDiscount}</strong>
            </p>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className={cn('rounded-lg px-4 py-2 text-sm font-medium', textTick ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600')}
            onClick={() => copyText('#transaction-summary')}
          >
            {textTick ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal isOpen={isModalOpen} onVerify={handlePasswordVerify} onClose={handleModalClose} />
    </div>
  );
};

const BillPopupData = memo(MemoBillPopupData);
export default BillPopupData;
