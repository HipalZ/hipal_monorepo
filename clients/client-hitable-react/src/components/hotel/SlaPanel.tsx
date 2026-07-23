import { Clock, Truck, UserCheck } from 'lucide-react';
import { memo } from 'react';
import { formatClock, useNow } from '../../hooks/useTime';

interface SlaPanelProps {
  createdAt: string | number | Date;
  acceptedAt?: number;
  deliveredAt?: number;
  rejectedAt?: number;
  /** SLA minutes taken from the alert's services. */
  acceptMins?: number;
  deliverMins?: number;
}

/** Amber once the final third of the window is left — "you're nearly out of time". */
const NEARLY_DUE = 1 / 3;

const TONES = {
  ok: { panel: 'border-blue-100 bg-blue-50/70', text: 'text-blue-600', chip: 'bg-blue-100 text-blue-700' },
  near: { panel: 'border-amber-100 bg-amber-50/70', text: 'text-amber-600', chip: 'bg-amber-100 text-amber-700' },
  late: { panel: 'border-red-100 bg-red-50/70', text: 'text-red-600', chip: 'bg-red-100 text-red-700' },
  good: { panel: 'border-emerald-100 bg-emerald-50/70', text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700' },
  idle: { panel: 'border-slate-200 bg-slate-50', text: 'text-slate-500', chip: 'bg-slate-100 text-slate-600' },
} as const;

type ToneKey = keyof typeof TONES;

/** Signed against a deadline: "+1h 08m" overrun, "08m 12s left" remaining. */
const remainingText = (ms: number) => (ms <= 0 ? `+${formatClock(ms)}` : `${formatClock(ms)} left`);

const Cell = memo(function Cell({
  label,
  icon,
  value,
  valueTone,
  chip,
  chipTone,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  valueTone: string;
  chip: string;
  chipTone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5">
      <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-bold tabular-nums ${valueTone}`}>{value}</span>
        <span className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${chipTone}`}>{chip}</span>
      </div>
    </div>
  );
});

/**
 * The request's SLA at a glance: a headline for the leg that is running now,
 * and a two-cell breakdown of acceptance and completion beneath it.
 *
 * Completion is due at createdAt + accept + deliver — the same additive total
 * the owner report and CSV use, so card and report can never disagree.
 */
const SlaPanel = memo(function SlaPanel({ createdAt, acceptedAt, deliveredAt, rejectedAt, acceptMins, deliverMins }: SlaPanelProps) {
  const started = new Date(createdAt).getTime();
  const acceptMs = (acceptMins || 0) * 60_000;
  const totalMs = acceptMs + (deliverMins || 0) * 60_000;

  const closed = Boolean(deliveredAt || rejectedAt);
  const now = useNow(!closed);

  // Wake-up calls and plain messages carry no service, so there is no SLA to show.
  if (!totalMs) return null;

  const acceptLeftMs = started + acceptMs - now;
  const totalLeftMs = started + totalMs - now;

  // The leg currently being raced decides the panel's colour.
  const activeLeftMs = acceptedAt ? totalLeftMs : acceptLeftMs;
  const activeWindow = acceptedAt ? totalMs : acceptMs;
  const fraction = activeWindow ? activeLeftMs / activeWindow : 0;

  const head = ((): { tone: ToneKey; title: string; value: string } => {
    if (deliveredAt) {
      const vsSla = deliveredAt - started - totalMs;
      const late = vsSla > 0;
      return {
        tone: late ? 'late' : 'good',
        title: late ? 'Delivered Late' : 'Delivered On Time',
        value: `${late ? '+' : '-'}${formatClock(vsSla)}`,
      };
    }
    if (rejectedAt) return { tone: 'idle', title: 'Rejected', value: formatClock(rejectedAt - started) };
    const tone: ToneKey = activeLeftMs <= 0 ? 'late' : fraction <= NEARLY_DUE ? 'near' : 'ok';
    const stage = acceptedAt ? 'Delivery' : 'Acceptance';
    return {
      tone,
      title: activeLeftMs <= 0 ? `${stage} Overdue` : acceptedAt ? 'Delivery In Progress' : 'Awaiting Acceptance',
      value: remainingText(activeLeftMs),
    };
  })();

  const tone = TONES[head.tone];

  // Acceptance: a finished leg reports what it took; a pending one counts down.
  const acceptTook = acceptedAt ? acceptedAt - started : null;
  const acceptTone: ToneKey = acceptTook !== null ? (acceptTook > acceptMs ? 'late' : 'good') : acceptLeftMs <= 0 ? 'late' : 'ok';

  const deliverTook = deliveredAt ? deliveredAt - started : null;
  const deliverTone: ToneKey = deliverTook !== null ? (deliverTook > totalMs ? 'late' : 'good') : totalLeftMs <= 0 ? 'late' : head.tone;

  return (
    <div className={`rounded-xl border p-3 ${tone.panel}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
          <Clock className="h-4 w-4" />
          {head.title}
        </div>
        <span className={`text-sm font-bold tabular-nums ${tone.text}`}>{head.value}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Cell
          label="Acceptance"
          icon={<UserCheck className="h-3 w-3" />}
          value={acceptTook !== null ? formatClock(acceptTook) : remainingText(acceptLeftMs)}
          valueTone={TONES[acceptTone].text}
          chip={acceptTook !== null ? (acceptTone === 'late' ? 'Late' : 'Accepted') : acceptLeftMs <= 0 ? 'Overdue' : 'Pending'}
          chipTone={TONES[acceptTone].chip}
        />
        <Cell
          label="Completion"
          icon={<Truck className="h-3 w-3" />}
          value={deliverTook !== null ? formatClock(deliverTook) : remainingText(totalLeftMs)}
          valueTone={TONES[deliverTone].text}
          chip={`SLA: ${(acceptMins || 0) + (deliverMins || 0)}m`}
          chipTone={TONES[deliverTone].chip}
        />
      </div>
    </div>
  );
});

export { SlaPanel };
