import BottomPopUp from '@/components/atoms/universalPopup';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { CheckoutTask } from '@/hooks/useCheckoutTasks';
import { formatClock, formatRaised, useNow } from '@/hooks/useTime';
import { BellRing, CheckCheck, CheckCircle, ChevronLeft, Loader2, Sparkles, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * One checkout turnover task. Mirrors the guest alert card's language — same
 * signed countdown (−4m 10s left, +1h 08m over) — so staff read one convention
 * across both lists.
 */
export const CheckoutTaskCard = ({
  task,
  onAccept,
  onComplete,
  onReject,
  busy,
}: {
  task: CheckoutTask;
  onAccept: () => void;
  onComplete: () => void;
  onReject: (reason: string) => void;
  busy: boolean;
}) => {
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const accepted = task.status === 'ACCEPTED';
  const closed = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const now = useNow(!closed);

  const deadline = accepted ? (task.completeDueAt ?? 0) : task.acceptDueAt;
  const leftMs = deadline - now;
  const overdue = leftMs <= 0;
  const windowMs = (accepted ? task.completeMins : task.acceptMins) * 60_000;
  const fraction = windowMs ? leftMs / windowMs : 0;

  const tone = overdue
    ? { text: 'text-red-600', panel: 'border-red-100 bg-red-50/70', bar: '#f43f5e' }
    : fraction <= 1 / 3
      ? { text: 'text-amber-600', panel: 'border-amber-100 bg-amber-50/70', bar: '#f59e0b' }
      : { text: 'text-blue-600', panel: 'border-blue-100 bg-blue-50/70', bar: '#3b82f6' };

  const headline = accepted ? (overdue ? 'Cleaning overdue' : 'Cleaning in progress') : overdue ? 'Acceptance overdue' : 'Awaiting acceptance';

  const rejectionReasons = [
    { id: 'item_unavailable', label: 'Item not available in inventory' },
    { id: 'service_unavailable', label: 'Service temporarily unavailable' },
    { id: 'staff_unavailable', label: 'Staff unavailable at the moment' },
    { id: 'maintenance_issue', label: 'Maintenance issue' },
    { id: 'other', label: 'Other reason' },
  ];

  const submitRejection = () => {
    const finalReason =
      rejectionReason === 'other' ? customReason.trim() : rejectionReasons.find((reason) => reason.id === rejectionReason)?.label || '';

    if (!finalReason) {
      toast.error('Please select a reason for rejection');
      return;
    }

    onReject(finalReason);
    setShowRejectPopup(false);
    setRejectionReason('');
    setCustomReason('');
  };

  return (
    <>
      <Card className="overflow-hidden border border-l-4 transition-all duration-200 hover:shadow-md" style={{ borderLeftColor: tone.bar }}>
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold leading-tight">Room {task.roomId?.name || '—'}</h3>
            <div className="min-w-0 text-right">
              <div className="truncate font-bold leading-tight">{task.serviceId?.name || 'Cleaning'}</div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              Checkout cleaning
            </span>
            {task.stage === 'MANAGER' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-100">
                <BellRing className="h-3 w-3" />
                ESCALATED
              </span>
            ) : task.stage === 'ALL_FLOORS' ? (
              <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">ALL FLOORS</span>
            ) : null}
            <span className="text-xs text-slate-500">Raised {formatRaised(task.createdAt)}</span>
          </div>

          <div className={`rounded-xl border p-3 ${tone.panel}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${tone.text}`}>{headline}</span>
              <span className={`text-sm font-bold tabular-nums ${tone.text}`}>
                {overdue ? '+' : '−'}
                {formatClock(leftMs)}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 bg-white p-2.5">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Accept within</div>
                <div className="text-sm font-bold text-slate-900">{task.acceptMins} min</div>
              </div>
              <div className="rounded-lg border border-slate-100 bg-white p-2.5">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Complete within</div>
                <div className="text-sm font-bold text-slate-900">{task.completeMins} min</div>
              </div>
            </div>
          </div>

          {accepted && task.acceptedBy?.name ? (
            <p className="mt-2 text-xs text-slate-500">
              Accepted by <b className="text-slate-700">{task.acceptedBy.name}</b>
            </p>
          ) : null}

          <div className="mt-3">
            {task.status === 'PENDING' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => setShowRejectPopup(true)}
                  disabled={busy}
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
                <Button className="bg-green-600 text-white hover:bg-green-700" onClick={onAccept} disabled={busy}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Accept
                </Button>
              </div>
            ) : null}
            {accepted ? (
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={onComplete} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
                Mark as Cleaned
              </Button>
            ) : null}
          </div>
        </div>
      </Card>
      {showRejectPopup && (
        <BottomPopUp hide show={true} onClose={() => !busy && setShowRejectPopup(false)}>
          <div className="px-4 pb-6 pt-4">
            <div className="mb-4 flex items-center gap-4">
              <Button variant="outline" disabled={busy} size="icon" onClick={() => !busy && setShowRejectPopup(false)} className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">Reject checkout cleaning</h2>
                <p className="text-sm text-gray-500">
                  Room {task.roomId?.name || '-'} · {task.serviceId?.name || 'Cleaning'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="mb-3 text-sm font-medium text-gray-700">Reason for rejection</h3>
              <RadioGroup value={rejectionReason} onValueChange={setRejectionReason} className="space-y-2">
                {rejectionReasons.map((reason) => (
                  <div key={reason.id} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50">
                    <RadioGroupItem value={reason.id} id={`checkout-task-reject-${reason.id}`} disabled={busy} />
                    <label htmlFor={`checkout-task-reject-${reason.id}`} className="flex-1 cursor-pointer text-sm">
                      {reason.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {rejectionReason === 'other' && (
              <div className="mb-4">
                <label htmlFor="checkout-task-custom-reason" className="mb-2 block text-sm font-medium text-gray-700">
                  Custom reason
                </label>
                <Textarea
                  id="checkout-task-custom-reason"
                  placeholder="Enter reason for rejection..."
                  value={customReason}
                  onChange={(event) => setCustomReason(event.target.value)}
                  disabled={busy}
                  className="min-h-[100px]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectPopup(false)} disabled={busy}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-600 text-white hover:bg-red-700" onClick={submitRejection} disabled={busy || !rejectionReason}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Reject Task
              </Button>
            </div>
          </div>
        </BottomPopUp>
      )}
    </>
  );
};
