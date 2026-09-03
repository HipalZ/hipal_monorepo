import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAcknowledgeWakeUpAlert, useDismissMessageAlert, useEditAlertCart, useRespondAlerts } from '@/hooks/useHotelApis';
import { formatRaised, useNow } from '@/hooks/useTime';
import { useMutation } from '@tanstack/react-query';
import { AlarmClock, AlertCircle, CheckCheck, CheckCircle, ChevronLeft, Clock, Loader2, Phone, ShoppingCart, User, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import CommonBottomButton from '../atoms/bottomButton';
import BottomPopUp from '../atoms/universalPopup';
import { useAlertsStore } from '../store/useAlertStore';
import { useHiClientZ } from '../store/useHiClientzData';
import type { Alert, Cart } from '../types/hotelData';
import { useAlertsColors } from '../utils/helpersHotel';
import CartDetailsHotel from './cartDetailsHotel';
import { SlaPanel } from './SlaPanel';

export interface AlertCardProps {
  alert: Alert;
}

/** Status pill styling + icon, one lookup keyed by alertProgress. */
const BADGES: Record<string, { cls: string; Icon: typeof AlertCircle }> = {
  CREATED: { cls: 'text-blue-700 ring-blue-100', Icon: Clock },
  ACCEPTED: { cls: 'text-emerald-700 ring-emerald-100', Icon: CheckCircle },
  DELIVERED: { cls: 'text-emerald-700 ring-emerald-100', Icon: CheckCheck },
  RESOLVED: { cls: 'text-slate-600 ring-slate-200', Icon: CheckCheck },
  NON_ACCEPTED_AND_WARNING: { cls: 'text-amber-700 ring-amber-100', Icon: AlertCircle },
  IS_ACCEPTED_AND_WARNING: { cls: 'text-amber-700 ring-amber-100', Icon: AlertCircle },
  NON_ACCEPTED_AND_ESCALATION: { cls: 'text-red-700 ring-red-100', Icon: AlertCircle },
  IS_ACCEPTED_AND_ESCALATION: { cls: 'text-red-700 ring-red-100', Icon: AlertCircle },
  NOT_DELIVERED: { cls: 'text-red-700 ring-red-100', Icon: AlertCircle },
  REJECTED: { cls: 'text-slate-600 ring-slate-200', Icon: XCircle },
  MESSAGE: { cls: 'text-violet-700 ring-violet-100', Icon: AlarmClock },
};
const FALLBACK_BADGE = { cls: 'bg-slate-100 text-slate-600 ring-slate-200', Icon: Clock };

type RemovedCartItem = {
  id: string;
  name: string;
  quantity: number;
  reason: string;
};

const getServiceQuantity = (alert: Alert, serviceId?: string) => {
  if (!serviceId) return 1;
  const requestedItem = alert?.serviceRequestItems?.find((item) => item.serviceId?.toString() === serviceId);
  return requestedItem?.quantity && requestedItem.quantity > 1 ? requestedItem.quantity : 1;
};

const hasSlaBreach = ({
  createdAt,
  acceptedAt,
  completedAt,
  acceptMins,
  deliverMins,
  progress,
  isEscalated,
  now,
}: {
  createdAt?: number;
  acceptedAt?: number;
  completedAt?: number;
  acceptMins: number;
  deliverMins: number;
  progress?: string;
  isEscalated?: boolean;
  now: number;
}) => {
  if (isEscalated || progress?.includes('ESCALATION')) return true;

  const startedAt = Number(createdAt || 0);
  if (!startedAt) return false;

  const acceptMs = Math.max(acceptMins, 0) * 60_000;
  const deliverMs = Math.max(deliverMins, 0) * 60_000;
  const accepted = Number(acceptedAt || 0);
  const completed = Number(completedAt || 0);
  const activeOrCompletedAt = completed || now;

  const acceptanceLate = acceptMs > 0 && (accepted ? accepted - startedAt > acceptMs : activeOrCompletedAt - startedAt > acceptMs);
  const deliveryLate =
    deliverMs > 0 &&
    (accepted > 0
      ? (completed ? completed - accepted : now - accepted) > deliverMs
      : completed > 0 && completed - startedAt > acceptMs + deliverMs);

  return acceptanceLate || deliveryLate;
};

function parseWakeUpMessage(message?: string) {
  const cleanMessage = message?.replace('WAKE_UP_CALL::', '') || '';
  const match = cleanMessage.match(/^(.*?) \((.*?)\) requested a wake-up call for (.*?)\. Note: (.*)$/);

  return {
    guestName: match?.[1] || '',
    guestPhone: match?.[2] || '',
    displayTime: match?.[3] || '',
    note: match?.[4] || '',
  };
}

export function AlertCardHotel({ alert }: AlertCardProps) {
  const { borderColor } = useAlertsColors();
  const staffRole = useHiClientZ((s) => s.selectedBiz?.role);
  const { showOrderDetails, setShowOrderDetails, setIsLoading, isLoading } = useAlertsStore();
  const { respondAlert } = useRespondAlerts();
  const { mutateAsync } = useMutation({
    mutationFn: respondAlert,
  });
  const { dismissAlert, isDismissing } = useDismissMessageAlert();
  const { acknowledgeWakeUpAlert, isAcknowledgingWakeUp } = useAcknowledgeWakeUpAlert();

  // State for rejection popup
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localCart, setLocalCart] = useState<Cart[]>(alert?.cart || []);
  const [removedCartItems, setRemovedCartItems] = useState<RemovedCartItem[]>([]);
  const { editCart, editingCart } = useEditAlertCart();

  useEffect(() => {
    if (showOrderDetails !== alert?._id) {
      setLocalCart(alert?.cart || []);
      setRemovedCartItems([]);
    }
  }, [alert?._id, alert?.cart, showOrderDetails]);

  const rejectionReasons = [
    { id: 'out_of_stock', label: 'Item out of stock' },
    { id: 'unavailable_service', label: 'Service temporarily unavailable' },
    { id: 'staff_unavailable', label: 'Staff unavailable at the moment' },
    { id: 'invalid_request', label: 'Invalid or unclear request' },
    { id: 'maintenance_issue', label: 'Maintenance issue' },
    { id: 'other', label: 'Other reason' },
  ];

  const handleAction = useCallback(
    async (alertId: string, action: string, reasonOfRejection?: string) => {
      setIsLoading(action);
      setIsSubmitting(true);
      try {
        await mutateAsync({ alertId, action, reasonOfRejection });
        toast.success(`Alert ${action?.toLowerCase()} successfully`);
        setShowRejectPopup(false);
      } catch (error) {
        toast.error(error?.message || 'Something went wrong');
      } finally {
        setIsLoading(null);
        setIsSubmitting(false);
        setRejectionReason('');
        setCustomReason('');
      }
    },
    [mutateAsync, setIsLoading],
  );

  const handleReject = useCallback(() => {
    setShowRejectPopup(true);
  }, []);

  const submitRejection = () => {
    const finalReason = rejectionReason === 'other' ? customReason.trim() : rejectionReasons.find((r) => r.id === rejectionReason)?.label || '';

    if (rejectionReason === 'other' && !customReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    handleAction(alert?._id, 'REJECTED', finalReason);
  };

  const removedOriginalItems = useMemo(() => {
    const remainingIds = new Set(localCart.map((item) => item.id));
    return (alert?.cart || []).filter((item) => !remainingIds.has(item.id));
  }, [alert?.cart, localCart]);

  const removedCartItemsWithReasons = useMemo(
    () =>
      removedOriginalItems.map((item) => {
        const recordedItem = removedCartItems.find((removedItem) => removedItem.id === item.id);
        return {
          id: item.id,
          name: item?.dish?.name || recordedItem?.name || 'Item',
          quantity: item?.quantity || recordedItem?.quantity || 1,
          reason: recordedItem?.reason?.trim() || '',
        };
      }),
    [removedCartItems, removedOriginalItems],
  );

  const hasMissingRemovalReason = removedCartItemsWithReasons.some((item) => !item.reason);

  const handleCartItemRemoved = useCallback((item: Cart, reason: string) => {
    setRemovedCartItems((items) => [
      ...items.filter((removedItem) => removedItem.id !== item.id),
      {
        id: item.id,
        name: item?.dish?.name || 'Item',
        quantity: item?.quantity || 1,
        reason: reason.trim(),
      },
    ]);
  }, []);

  const updateCart = async (alertId: string) => {
    if (!removedOriginalItems.length) {
      toast.error('Please remove at least one item before updating');
      return;
    }

    if (hasMissingRemovalReason) {
      toast.error('Please add a reason for every removed item');
      return;
    }

    try {
      await editCart({
        alertId,
        cart: localCart,
        removedItems: removedCartItemsWithReasons,
      });
      setRemovedCartItems([]);
      setShowOrderDetails(null);
    } catch {
      // The mutation hook already displays the failure toast.
    }
  };

  const cancelChanges = () => {
    setLocalCart(alert?.cart || []);
    setRemovedCartItems([]);
    setShowOrderDetails(null);
  };

  const hasCart = alert?.cart && alert?.cart?.length > 0;
  const isWakeUpCallAlert = ['MESSAGE', 'NOT_DELIVERED'].includes(alert?.alertProgress) && alert?.message?.startsWith('WAKE_UP_CALL::');
  const now = useNow(isWakeUpCallAlert && !alert?.deliveredAt && !alert?.rejectedAt);
  const wakeUpAt = Number(alert?.wakeUpAt || 0);
  const isWakeUpCallDue = isWakeUpCallAlert && (alert?.alertProgress === 'NOT_DELIVERED' || (wakeUpAt > 0 && wakeUpAt <= now));
  const isWakeUpAcknowledged = isWakeUpCallAlert && Boolean(alert?.acceptedBy);
  const wakeUpInfo = isWakeUpCallAlert ? parseWakeUpMessage(alert?.message) : null;
  const isCheckoutRequest = !isWakeUpCallAlert && (alert?.message?.startsWith('CHECKOUT_REQUEST::') ?? false);
  const guestName = wakeUpInfo?.guestName || alert?.createdBy?.name || '';
  const guestPhone = wakeUpInfo?.guestPhone || alert?.createdBy?.phone || '';
  const displayMessage = isWakeUpCallAlert
    ? `Requested wake-up call for ${wakeUpInfo?.displayTime || 'the selected time'}. Note: ${wakeUpInfo?.note || 'Wake-up call'}`
    : isCheckoutRequest
      ? alert.message.slice('CHECKOUT_REQUEST::'.length)
      : alert?.message;
  const serviceInstruction = alert?.serviceInstructionSnapshot?.message?.trim();
  // A request isn't done until its slowest service is done, so the SLA runs
  // against the largest on the alert. 0/0 → SlaPanel renders nothing (wake-up
  // calls and plain messages have no service attached).
  const services = alert?.serviceIds || [];
  const serviceAcceptMins = services.reduce((max, service) => Math.max(max, service?.avgAcceptanceTime || 0), 0);
  const serviceDeliverMins = services.reduce((max, service) => Math.max(max, service?.avgDeliveryTime ?? service?.avgCompletionTime ?? 0), 0);
  const foodPrepMins = hasCart ? alert.cart.reduce((max, item) => Math.max(max, item?.dish?.avgPrepTime || 0), 0) : 0;
  const foodDeliverMins = hasCart ? foodPrepMins || 30 : 0;
  const acceptMins = serviceAcceptMins || (hasCart ? 2 : 0);
  const deliverMins = hasCart ? foodDeliverMins : serviceDeliverMins;

  // The header names the request; extra services collapse into a "+N more".
  const serviceSummaries = services
    .map((service) => {
      if (!service?.name) return null;
      const quantity = getServiceQuantity(alert, service._id);
      return { name: service.name, quantity };
    })
    .filter((service): service is { name: string; quantity: number } => Boolean(service));
  const serviceNames = serviceSummaries.map((service) => service.name);
  const primaryService =
    serviceNames[0] || (hasCart ? 'Food Order' : isWakeUpCallAlert ? 'Wake-up Call' : isCheckoutRequest ? 'Checkout' : 'Message');
  const primaryServiceQuantity = serviceSummaries[0]?.quantity || 1;
  const extraServices = Math.max(0, serviceNames.length - 1);

  const badge = (isWakeUpCallDue ? BADGES.NOT_DELIVERED : isWakeUpCallAlert ? BADGES.MESSAGE : BADGES[alert?.alertProgress]) ?? FALLBACK_BADGE;

  const PENDING_STATES = ['CREATED', 'NON_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_ESCALATION'];
  const ACCEPTED_STATES = ['ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION'];
  const CLOSED_STATES = ['REJECTED', 'DELIVERED'];
  const ESCALATION_STATES = ['NON_ACCEPTED_AND_ESCALATION', 'IS_ACCEPTED_AND_ESCALATION'];
  const isEscalatedAlert = ESCALATION_STATES.includes(alert?.alertProgress ?? '');
  const escalationLevel = isEscalatedAlert ? alert?.level || 1 : null;
  const slaWatchNow = useNow(!['DELIVERED', 'REJECTED', 'RESOLVED', 'NOT_DELIVERED'].includes(alert?.alertProgress ?? ''));
  const isSlaBreached = hasSlaBreach({
    createdAt: alert?.createdAt,
    acceptedAt: alert?.acceptedAt,
    completedAt: alert?.deliveredAt || alert?.rejectedAt,
    acceptMins,
    deliverMins,
    progress: alert?.alertProgress,
    isEscalated: alert?.isEscalated,
    now: slaWatchNow,
  });

  const isPendingState = (p?: string) => PENDING_STATES.includes(p ?? '');
  const isAcceptedState = (p?: string) => ACCEPTED_STATES.includes(p ?? '');
  const isClosedState = (p?: string) => CLOSED_STATES.includes(p ?? '');

  const ALERT_PROGRESS_LABELS: Record<string, string> = {
    CREATED: 'Created',
    NON_ACCEPTED_AND_WARNING: 'Warning',
    NON_ACCEPTED_AND_ESCALATION: 'Escalation',
    IS_ACCEPTED_AND_WARNING: 'Warning',
    IS_ACCEPTED_AND_ESCALATION: 'Escalation',
    ACCEPTED: 'Accepted',
    DELIVERED: 'Delivered',
    NOT_DELIVERED: isWakeUpCallAlert ? 'Wake-up Due Now' : 'Not Delivered',
    RESOLVED: 'Resolved',
    MESSAGE: isWakeUpCallAlert ? 'Wake-up Call' : 'Message',
  };

  const getAlertLabel = (progress?: string) => (isWakeUpCallDue ? 'Wake-up Due Now' : ALERT_PROGRESS_LABELS[progress ?? ''] || progress || 'Unknown');

  return (
    <Card
      className={`${
        isWakeUpCallDue || alert?.alertProgress === 'NOT_DELIVERED' ? 'animation-blink' : ''
      } overflow-hidden border border-l-4 transition-all duration-200 hover:shadow-md ${
        isSlaBreached ? 'border-red-200 bg-red-50/60 shadow-[0_10px_28px_rgba(220,38,38,0.08)]' : 'bg-white'
      }`}
      style={{
        borderLeftColor: isSlaBreached || isWakeUpCallDue ? '#dc2626' : isWakeUpCallAlert ? '#7c3aed' : borderColor(alert?.alertProgress),
      }}
    >
      {/* Primary information section */}
      <div className="p-4">
        {/* Room + what was requested */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight">Room {alert?.roomId?.name}</h3>
          <div className="min-w-0 text-right">
            <div className="truncate font-bold leading-tight">{primaryService}</div>
            <div className="mt-1 flex flex-wrap justify-end gap-1">
              {primaryServiceQuantity > 1 ? (
                <span className="inline-flex rounded-full border bg-blue-700 px-2 py-0.5 text-[11px] font-bold text-white">
                  Qty: {primaryServiceQuantity}
                </span>
              ) : null}
              {extraServices > 0 ? <span className="text-[11px] text-slate-500">+{extraServices} more</span> : null}
            </div>
          </div>
        </div>

        {/* Status + when it came in */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge.cls}`}>
              <badge.Icon className="h-3.5 w-3.5" />
              {getAlertLabel(alert?.alertProgress)}
            </span>
            {escalationLevel ? (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 ring-1 ring-red-100">
                L{escalationLevel}
              </span>
            ) : null}
          </div>
          <span className="text-xs text-slate-500">Raised {formatRaised(alert?.createdAt)}</span>
        </div>

        <SlaPanel
          createdAt={alert?.createdAt}
          acceptedAt={alert?.acceptedAt}
          deliveredAt={alert?.deliveredAt}
          rejectedAt={alert?.rejectedAt}
          acceptMins={acceptMins}
          deliverMins={deliverMins}
        />

        {displayMessage ? (
          <p className={`mt-3 text-sm ${isWakeUpCallAlert ? 'rounded-lg bg-violet-50 p-3 font-semibold text-violet-950' : 'text-slate-700'}`}>
            {displayMessage}
          </p>
        ) : null}
        {serviceInstruction ? (
          <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm font-medium text-blue-950">{serviceInstruction}</p>
        ) : null}
        {/* Order details button */}
        {hasCart && (
          <Button size="sm" variant="outline" className="w-full bg-indigo-400 text-white" onClick={() => setShowOrderDetails(alert._id)}>
            <ShoppingCart className="mr-1 h-3.5 w-3.5" />
            Order Details
          </Button>
        )}

        {/* Secondary information in accordion */}
        <Accordion type="single" collapsible className="mb-3">
          <AccordionItem value="guest-info" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm font-medium text-gray-900">Guest Info</AccordionTrigger>
            <AccordionContent>
              <div className="rounded-md bg-gray-50 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Guest</div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3.5 w-3.5 text-gray-600" />
                      <span className="font-medium">{guestName || 'Guest'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-gray-500">Contact</div>
                    <div className="flex items-center">
                      <Phone className="mr-1 h-3.5 w-3.5 text-gray-600" />
                      <span>
                        {staffRole === 'MANAGER'
                          ? guestPhone
                          : guestPhone
                            ? guestPhone.replace(
                                /^(\d{2})\d{5,}(\d{2})$/,
                                (match, p1, p2) => `${p1}${'*'.repeat(guestPhone.length - (p1.length + p2.length))}${p2}`,
                              )
                            : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {alert?.acceptedBy && (
                  <div className="mt-2 border-t border-gray-200 pt-2">
                    <div className="mb-1 text-xs text-gray-500">{isWakeUpCallAlert ? 'Acknowledged By' : 'Accepted By'}</div>
                    <div className="flex items-center text-green-600">
                      <User className="mr-1 h-3.5 w-3.5" />
                      <span className="font-medium">{alert?.acceptedBy?.name}</span>
                    </div>
                    {isWakeUpCallAlert && (
                      <p className="mt-1 text-xs text-gray-600">This staff member has confirmed they will remind the guest at the requested time.</p>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action buttons */}
        <div className={`flex gap-2 ${isWakeUpCallAlert ? 'flex-col' : ''}`}>
          {isPendingState(alert?.alertProgress) ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={handleReject}
                disabled={isLoading !== null}
              >
                {isLoading === 'REJECTED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Reject
              </Button>
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleAction(alert?._id, 'ACCEPTED')}
                disabled={isLoading !== null}
              >
                {isLoading === 'ACCEPTED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Accept
              </Button>
            </>
          ) : null}

          {isAcceptedState(alert?.alertProgress) ? (
            <Button
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => handleAction(alert?._id, 'DELIVERED')}
              disabled={isLoading !== null}
            >
              {isLoading === 'DELIVERED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
              Mark as Delivered
            </Button>
          ) : null}

          {isWakeUpCallAlert && alert?.alertProgress === 'MESSAGE' && !isWakeUpAcknowledged ? (
            <Button
              className="w-full rounded-md border border-emerald-700 !bg-emerald-600 font-semibold !text-white shadow-sm hover:!bg-emerald-700"
              onClick={async () => {
                try {
                  await acknowledgeWakeUpAlert(alert?._id);
                  toast.success('Wake-up call acknowledged');
                } catch (error) {
                  toast.error(error?.message || 'Failed to acknowledge wake-up call');
                }
              }}
              disabled={isAcknowledgingWakeUp}
            >
              {isAcknowledgingWakeUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Acknowledge Wake-up Call
            </Button>
          ) : null}

          {isWakeUpCallAlert && isWakeUpAcknowledged && !isWakeUpCallDue ? (
            <div className="w-full rounded-md border border-emerald-200 bg-emerald-50 py-2 text-center text-sm font-semibold text-emerald-800">
              Wake-up accepted
            </div>
          ) : null}

          {isWakeUpCallAlert && isWakeUpCallDue ? (
            <Button
              className="w-full rounded-md !bg-blue-600 font-semibold !text-white shadow-sm hover:!bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              onClick={async () => {
                try {
                  await dismissAlert(alert?._id);
                  toast.success('Wake-up call fulfilled');
                } catch (error) {
                  toast.error(error?.message || 'Failed to complete wake-up call');
                }
              }}
              disabled={isDismissing}
            >
              {isDismissing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
              Wake-up Fulfilled
            </Button>
          ) : null}

          {alert?.alertProgress === 'MESSAGE' && (!isWakeUpCallAlert || !isWakeUpAcknowledged) ? (
            <Button
              className={`w-full rounded-md border font-semibold shadow-sm ${
                isWakeUpCallAlert
                  ? 'border-violet-900 !bg-violet-700 !text-white hover:!bg-violet-800'
                  : 'border-black !bg-black !text-white hover:!bg-black'
              }`}
              onClick={async () => {
                try {
                  await dismissAlert(alert?._id);
                  toast.success('Alert dismissed successfully');
                } catch (error) {
                  toast.error(error?.message || 'Failed to dismiss alert');
                }
              }}
              disabled={isDismissing}
            >
              {isDismissing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
              {isWakeUpCallAlert ? 'Cancel Wake-up Call' : 'Remove'}
            </Button>
          ) : null}

          {alert.alertProgress === 'NOT_DELIVERED' && !isWakeUpCallAlert && (
            <Button
              className="w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => handleAction(alert?._id, 'RESOLVED')}
              disabled={isLoading !== null}
            >
              {isLoading === 'NOT_DELIVERED' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
              Mark as Resolved
            </Button>
          )}

          {isClosedState(alert?.alertProgress) && (
            <div className="w-full rounded-md bg-gray-50 py-2 text-center text-sm text-gray-500">No action required</div>
          )}
        </div>
      </div>

      {/* Order details popup */}
      {showOrderDetails === alert?._id && (
        <BottomPopUp hide show={true} onClose={() => setShowOrderDetails(null)}>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <Button size="icon" onClick={() => setShowOrderDetails(null)} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">Order Details - Room {alert?.roomId?.name}</h2>
            </div>

            {hasCart ? (
              <div className="space-y-3 p-4">
                <CartDetailsHotel localCart={localCart} setLocalCart={setLocalCart} readOnly={false} onItemRemoved={handleCartItemRemoved} />
                {removedCartItemsWithReasons.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                    <div className="mb-2 text-sm font-semibold text-amber-950">Items removed</div>
                    <div className="space-y-2">
                      {removedCartItemsWithReasons.map((item) => (
                        <div key={item.id} className="rounded-lg bg-white px-3 py-2 text-xs text-amber-950 shadow-sm">
                          <div className="font-semibold">
                            {item.quantity} x {item.name}
                          </div>
                          <div className="mt-1 text-amber-800">Reason: {item.reason || 'Reason required'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p>No order items found</p>
              </div>
            )}
          </div>
          <CommonBottomButton
            maxWidth="30rem"
            position="mid"
            fixed
            shadow
            buttons={[
              {
                text: 'Cancel',
                onClick: cancelChanges,
                className: 'rounded-lg pl-3',
              },
              {
                text: 'Update',
                onClick: () => updateCart(alert?._id),
                hide: alert?.alertProgress === 'MESSAGE',
                className: 'rounded-lg shadow-md text-white',
                disable: editingCart || !removedOriginalItems.length || hasMissingRemovalReason,
              },
            ]}
          />
        </BottomPopUp>
      )}

      {/* Rejection Reason Popup */}
      {showRejectPopup && (
        <BottomPopUp hide show={true} onClose={() => !isSubmitting && setShowRejectPopup(false)}>
          <div className="px-4 pb-6 pt-4">
            <div className="mb-4 flex items-center gap-4">
              <Button
                variant="outline"
                disabled={isSubmitting}
                size="icon"
                onClick={() => !isSubmitting && setShowRejectPopup(false)}
                className="mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">Reason for Rejection</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">Please select a reason for rejecting this request from Room {alert?.roomId?.name}</p>

              <RadioGroup value={rejectionReason} onValueChange={setRejectionReason} className="gap-3">
                {rejectionReasons.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value={reason.id} id={reason.id} />
                    <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                      {reason.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {rejectionReason === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-reason">Please specify (max 120 characters)</Label>
                  <Textarea
                    id="custom-reason"
                    placeholder="Enter reason for rejection..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value.slice(0, 120))}
                    maxLength={120}
                    className="resize-none"
                  />
                  <div className="text-right text-xs text-gray-500">{customReason.length}/120 characters</div>
                </div>
              )}

              <Button
                className="w-full bg-red-600 text-white hover:bg-red-700"
                onClick={submitRejection}
                disabled={!rejectionReason || (rejectionReason === 'other' && !customReason.trim()) || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Confirm Rejection
              </Button>
            </div>
          </div>
        </BottomPopUp>
      )}
    </Card>
  );
}
