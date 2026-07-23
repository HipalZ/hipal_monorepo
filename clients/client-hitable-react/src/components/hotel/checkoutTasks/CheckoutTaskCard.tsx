import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { CheckoutTask } from '@/hooks/useCheckoutTasks';
import { formatClock, formatRaised, useNow } from '@/hooks/useTime';
import { BellRing, CheckCheck, CheckCircle, Loader2, Sparkles } from 'lucide-react';

/**
 * One checkout turnover task. Mirrors the guest alert card's language — same
 * signed countdown (−4m 10s left, +1h 08m over) — so staff read one convention
 * across both lists.
 */
export const CheckoutTaskCard = ({
  task,
  onAccept,
  onComplete,
  busy,
}: {
  task: CheckoutTask;
  onAccept: () => void;
  onComplete: () => void;
  busy: boolean;
}) => {
  const accepted = task.status === 'ACCEPTED';
  const closed = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const now = useNow(!closed);

  const deadline = accepted ? task.completeDueAt ?? 0 : task.acceptDueAt;
  const leftMs = deadline - now;
  const overdue = leftMs <= 0;
  const windowMs = (accepted ? task.completeMins : task.acceptMins) * 60_000;
  const fraction = windowMs ? leftMs / windowMs : 0;

  const tone = overdue
    ? { text: 'text-red-600', panel: 'border-red-100 bg-red-50/70', bar: '#f43f5e' }
    : fraction <= 1 / 3
      ? { text: 'text-amber-600', panel: 'border-amber-100 bg-amber-50/70', bar: '#f59e0b' }
      : { text: 'text-blue-600', panel: 'border-blue-100 bg-blue-50/70', bar: '#3b82f6' };

  const headline = accepted
    ? overdue
      ? 'Cleaning overdue'
      : 'Cleaning in progress'
    : overdue
      ? 'Acceptance overdue'
      : 'Awaiting acceptance';

  return (
    <Card className="overflow-hidden border border-l-4 transition-all duration-200 hover:shadow-md" style={{ borderLeftColor: tone.bar }}>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold leading-tight">Room {task.roomId?.name || '—'}</h3>
          <div className="min-w-0 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Turnover</div>
            <div className="truncate font-bold leading-tight">{task.serviceId?.name || 'Cleaning'}</div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
            Checkout cleaning
          </span>
          {task.stage === 'MANAGER' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-100">
              <BellRing className="h-3 w-3" />
              ESCALATED
            </span>
          ) : task.stage === 'ALL_FLOORS' ? (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-100">
              ALL FLOORS
            </span>
          ) : null}
          <span className="text-slate-300">·</span>
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
            <Button className="w-full bg-green-600 text-white hover:bg-green-700" onClick={onAccept} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Accept
            </Button>
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
  );
};
