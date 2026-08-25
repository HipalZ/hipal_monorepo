import { CheckCircle2, Clock, UserCheck } from 'lucide-react';
import { memo, type ReactNode } from 'react';
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
  near: { panel: 'border-emerald-100 bg-emerald-50/70', text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700' },
  late: { panel: 'border-red-100 bg-red-50/70', text: 'text-red-600', chip: 'bg-red-100 text-red-700' },
  good: { panel: 'border-emerald-100 bg-emerald-50/70', text: 'text-emerald-600', chip: 'bg-emerald-100 text-emerald-700' },
  idle: { panel: 'border-slate-200 bg-slate-50', text: 'text-slate-500', chip: 'bg-slate-100 text-slate-600' },
} as const;

type ToneKey = keyof typeof TONES;

const RING_COLORS: Record<ToneKey, string> = {
  ok: '#2563eb',
  near: '#16a34a',
  late: '#dc2626',
  good: '#16a34a',
  idle: '#94a3b8',
};

/** Signed against a deadline: "+1h 08m" overrun, "08m 12s left" remaining. */
const remainingText = (ms: number) => (ms <= 0 ? `+${formatClock(ms)}` : `${formatClock(ms)} left`);
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

const splitClock = (ms: number) => {
  const total = Math.floor(Math.abs(ms) / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return {
    mins: mins.toString().padStart(2, '0'),
    secs: secs.toString().padStart(2, '0'),
  };
};

const formatTargetTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const Cell = memo(function Cell({
  label,
  icon,
  value,
  valueTone,
  helper,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  valueTone: string;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-2.5">
      <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className={`min-w-0 text-sm font-bold tabular-nums ${valueTone}`}>{value}</span>
      </div>
      {helper ? <div className="mt-1 text-[10px] font-medium text-slate-400">{helper}</div> : null}
    </div>
  );
});

const ProgressRing = memo(function ProgressRing({ percent, toneKey, overdue }: { percent: number; toneKey: ToneKey; overdue: boolean }) {
  const size = 68;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringPercent = overdue ? 100 : clamp(percent);
  const offset = circumference - (ringPercent / 100) * circumference;
  const color = RING_COLORS[toneKey];

  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center font-bold ${TONES[toneKey].text}`}>
        {overdue ? (
          <span className="text-[10px] leading-none">Overdue</span>
        ) : (
          <>
            <span className="text-sm leading-none">{Math.round(clamp(percent))}%</span>
            <span className="mt-0.5 text-[9px] leading-none">remaining</span>
          </>
        )}
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
  const fulfillMs = (deliverMins || 0) * 60_000;
  const totalMs = acceptMs + fulfillMs;

  const closed = Boolean(deliveredAt || rejectedAt);
  const now = useNow(!closed);

  // Wake-up calls and plain messages carry no service, so there is no SLA to show.
  if (!totalMs) return null;

  const acceptLeftMs = started + acceptMs - now;
  const fulfillLeftMs = (acceptedAt || started + acceptMs) + fulfillMs - now;

  // The leg currently being raced decides the panel's colour.
  const activeLeftMs = acceptedAt ? fulfillLeftMs : acceptLeftMs;
  const activeWindow = acceptedAt ? fulfillMs : acceptMs;
  const fraction = activeWindow ? activeLeftMs / activeWindow : 0;

  const head = ((): { tone: ToneKey; title: string } => {
    if (deliveredAt) {
      const vsSla = acceptedAt ? deliveredAt - acceptedAt - fulfillMs : deliveredAt - started - totalMs;
      const late = vsSla > 0;
      return {
        tone: late ? 'late' : 'good',
        title: late ? 'Completed Late' : 'Completed On Time',
      };
    }
    if (rejectedAt) return { tone: 'idle', title: 'Rejected' };
    const tone: ToneKey = activeLeftMs <= 0 ? 'late' : acceptedAt && fraction <= NEARLY_DUE ? 'near' : 'ok';
    return {
      tone,
      title:
        activeLeftMs <= 0
          ? acceptedAt
            ? 'SLA Overdue'
            : 'Acceptance Overdue'
          : acceptedAt
            ? fraction <= 0.1
              ? 'Ready to Deliver'
              : 'SLA in progress'
            : 'Awaiting Acceptance',
    };
  })();

  const tone = TONES[head.tone];

  // Acceptance: a finished leg reports what it took; a pending one counts down.
  const acceptTook = acceptedAt ? acceptedAt - started : null;
  const acceptTone: ToneKey = acceptTook !== null ? (acceptTook > acceptMs ? 'late' : 'good') : acceptLeftMs <= 0 ? 'late' : 'ok';

  const deliverTook = deliveredAt && acceptedAt ? deliveredAt - acceptedAt : null;
  const deliverTone: ToneKey = !acceptedAt
    ? 'idle'
    : deliverTook !== null
      ? deliverTook > fulfillMs
        ? 'late'
        : 'good'
      : fulfillLeftMs <= 0
        ? 'late'
        : head.tone;

  const isActiveRequest = !closed;
  const activeOverdue = isActiveRequest && activeLeftMs <= 0;
  const activeElapsedPercent = activeWindow ? clamp(((activeWindow - activeLeftMs) / activeWindow) * 100) : 0;
  const activeRemainingPercent = activeWindow ? clamp((activeLeftMs / activeWindow) * 100) : 0;
  const progressPercent = activeOverdue ? 100 : activeElapsedPercent;
  const ringPercent = activeOverdue ? 100 : activeRemainingPercent;
  const timer = splitClock(activeLeftMs);
  const timerLabel = activeOverdue ? 'Overdue by' : acceptedAt ? 'Time remaining' : 'Waiting for staff to accept';
  const activeTarget = acceptedAt ? acceptedAt + fulfillMs : started + acceptMs;
  const activeSlaLabel = acceptedAt ? `${deliverMins || 0}m` : `${acceptMins || 0}m`;
  const progressColor = RING_COLORS[head.tone];

  return (
    <div className={`my-2 rounded-xl border p-3 ${tone.panel}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
          <Clock className="h-4 w-4" />
          {head.title}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${tone.chip}`}>SLA: {activeSlaLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Cell
          label="Acceptance"
          icon={<UserCheck className="h-3 w-3" />}
          value={acceptTook !== null ? `Accepted in ${formatClock(acceptTook)}` : remainingText(acceptLeftMs)}
          valueTone={TONES[acceptTone].text}
          helper={acceptTook !== null ? undefined : `Target ${formatTargetTime(started + acceptMs)}`}
        />
        <Cell
          label="Fulfillment"
          icon={<CheckCircle2 className="h-3 w-3" />}
          value={!acceptedAt ? `SLA: ${deliverMins || 0}m` : deliverTook !== null ? formatClock(deliverTook) : remainingText(fulfillLeftMs)}
          valueTone={TONES[deliverTone].text}
        />
      </div>

      {isActiveRequest ? (
        <div className={`mt-3 rounded-xl border bg-white/70 p-3 ${activeOverdue ? 'border-red-100' : 'border-white/80'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={`mb-1 flex items-center gap-1.5 text-xs font-semibold ${tone.text}`}>{timerLabel}</div>
              <div className={`flex items-end gap-1 font-bold tabular-nums ${tone.text}`}>
                <span className="text-[1.7rem] leading-none">{timer.mins}</span>
                <span className="pb-0.5 text-[1.05rem] leading-none">:</span>
                <span className="text-[1.7rem] leading-none">{timer.secs}</span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-slate-500">Target {formatTargetTime(activeTarget)}</div>
            </div>
            <ProgressRing percent={ringPercent} toneKey={head.tone} overdue={activeOverdue} />
          </div>

          <div className="mt-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${progressPercent}%`, backgroundColor: progressColor }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[9px] font-bold text-slate-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
});

export { SlaPanel };
