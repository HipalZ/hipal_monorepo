import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useAcknowledgeWakeUpAlert, useDismissMessageAlert, useEditAlertCart, useRespondAlerts } from '@/hooks/useHotelApis';
import { useMutation } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { AlarmClock, CheckCheck, CheckCircle, ChevronLeft, Loader2, Phone, ShoppingCart, User, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import CommonBottomButton from '../atoms/bottomButton';
import BottomPopUp from '../atoms/universalPopup';
import { useAlertsStore } from '../store/useAlertStore';
import { useHiClientZ } from '../store/useHiClientzData';
import type { Alert, Cart } from '../types/hotelData';
import { useAlertsColors } from '../utils/helpersHotel';
import CartDetailsHotel from './cartDetailsHotel';
import { RingClock } from './RingClock';

export interface AlertCardProps {
  alert: Alert;
}

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
  const { editCart } = useEditAlertCart();

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

  // API mutation for updating the cart
  const { isPending } = useMutation({
    mutationFn: editCart,
  });

  const updateCart = (alertId: string) => {
    editCart({
      alertId: alertId,
      cart: localCart,
    });
    setShowOrderDetails(null);
  };

  const cancelChanges = () => {
    setLocalCart(alert?.cart);
    setShowOrderDetails(null);
  };

  const hasCart = alert?.cart && alert?.cart?.length > 0;
  const isWakeUpCallAlert = ['MESSAGE', 'NOT_DELIVERED'].includes(alert?.alertProgress) && alert?.message?.startsWith('WAKE_UP_CALL::');
  const isWakeUpCallDue = isWakeUpCallAlert && alert?.alertProgress === 'NOT_DELIVERED';
  const isWakeUpAcknowledged = isWakeUpCallAlert && Boolean(alert?.acceptedBy);
  const wakeUpInfo = isWakeUpCallAlert ? parseWakeUpMessage(alert?.message) : null;
  const guestName = wakeUpInfo?.guestName || alert?.createdBy?.name || '';
  const guestPhone = wakeUpInfo?.guestPhone || alert?.createdBy?.phone || '';
  const displayMessage = isWakeUpCallAlert
    ? `Requested wake-up call for ${wakeUpInfo?.displayTime || 'the selected time'}. Note: ${wakeUpInfo?.note || 'Wake-up call'}`
    : alert?.message;
  const timeAgo = formatDistanceToNow(new Date(alert?.createdAt), {
    addSuffix: true,
  });

  const PENDING_STATES = ['CREATED', 'NON_ACCEPTED_AND_WARNING', 'NON_ACCEPTED_AND_ESCALATION'];
  const ACCEPTED_STATES = ['ACCEPTED', 'IS_ACCEPTED_AND_WARNING', 'IS_ACCEPTED_AND_ESCALATION'];
  const CLOSED_STATES = ['REJECTED', 'DELIVERED'];

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

  const getAlertLabel = (progress?: string) => ALERT_PROGRESS_LABELS[progress ?? ''] || progress || 'Unknown';

  return (
    <Card
      className={`${
        alert?.alertProgress === 'NOT_DELIVERED' ? 'animation-blink' : ''
      } overflow-hidden border border-l-4 transition-all duration-200 hover:shadow-md`}
      style={{
        borderLeftColor: isWakeUpCallDue ? '#dc2626' : isWakeUpCallAlert ? '#7c3aed' : borderColor(alert?.alertProgress),
      }}
    >
      {/* Primary information section */}
      <div className="p-4">
        {/* Room number and time */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center text-lg font-bold">Room {alert?.roomId?.name}</h3>
          <RingClock createdAt={alert?.createdAt} />
        </div>
        <h1
          className={`my-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${
            isWakeUpCallDue
              ? 'bg-red-100 text-red-900 ring-1 ring-red-200'
              : isWakeUpCallAlert
              ? 'bg-violet-100 text-violet-900 ring-1 ring-violet-200'
              : 'bg-slate-100 text-slate-900'
          }`}
        >
          {isWakeUpCallAlert && <AlarmClock className="h-4 w-4" />}
          {getAlertLabel(alert?.alertProgress)}
        </h1>
        {/* Services */}
        <div className="mb-3 flex flex-wrap gap-2">
          {alert?.serviceIds.map((service) => (
            <article key={service._id} className="inline-flex">
              {service.image ? (
                <div className="h-[100px] w-[100px] flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                  <img
                    src={service.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
              <div key={service._id} className="group flex items-center gap-3 rounded-xl bg-white px-2 py-1.5 text-slate-900 transition-colors">
                <span className="pr-1 text-base font-semibold">{service?.name}</span>
              </div>
            </article>
          ))}
          <h1 className={`text-sm ${isWakeUpCallAlert ? 'rounded-lg bg-violet-50 p-3 font-semibold text-violet-950' : ''}`}>
            {displayMessage}
          </h1>
        </div>

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
            <AccordionTrigger className="py-2 text-sm font-medium text-gray-900">Guest Information</AccordionTrigger>
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
                      <p className="mt-1 text-xs text-gray-600">
                        This staff member has confirmed they will remind the guest at the requested time.
                      </p>
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
              className="w-full rounded-md border border-emerald-700 !bg-emerald-600 !text-white font-semibold shadow-sm hover:!bg-emerald-700"
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
              className="w-full rounded-md border border-emerald-900 !bg-emerald-700 !text-white font-semibold shadow-sm hover:!bg-emerald-800"
              onClick={async () => {
                try {
                  await dismissAlert(alert?._id);
                  toast.success('Wake-up call marked as informed');
                } catch (error) {
                  toast.error(error?.message || 'Failed to complete wake-up call');
                }
              }}
              disabled={isDismissing}
            >
              {isDismissing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
              Informed Guest
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
                <CartDetailsHotel localCart={localCart} setLocalCart={setLocalCart} readOnly={false} />
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
                disable: isPending,
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
