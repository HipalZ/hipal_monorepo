import { ArrowDown, ArrowUp, ChevronsUpDown, Info, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ServiceStat, StaffStat } from './analytics';
import { formatDuration, formatMins } from './format';
import type { GuestImportance, RequestSortKey, ServicePerf } from './model';
import { bar, card, chip, cx, kpi, pill, th } from './styles';

/** Green good / red bad hexes for inline SVG-style gradients (tokens can't be interpolated there). */
const GOOD_HEX = '#3d7a17';
const BAD_HEX = '#b23a2e';

export const LiveBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-report-good">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-report-good opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-report-good" />
    </span>
    Live · updates as staff accept &amp; deliver
  </span>
);

export const NoteBanner = ({ canDownload, months }: { canDownload: boolean; months: number }) => (
  <div
    className={cx(
      'mt-3 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed',
      canDownload
        ? 'border-report-accent-line bg-report-accent-bg text-[#86285a]'
        : 'border-report-warn-line bg-report-warn-bg text-report-warn',
    )}
  >
    <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
    <span>
      Guest Experience Report maps guest, room, service request, accepted &amp; delivered staff, escalation, and SLA
      performance for every request. Downloads support up to {months} months at a time.
    </span>
  </div>
);

export const KpiCard = ({
  label,
  value,
  unit,
  sub,
  tone,
  hero,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  tone?: string;
  hero?: boolean;
}) => (
  <div className={cx(card, 'p-[15px]', hero && 'ring-1 ring-report-accent-line')}>
    <div className={kpi.label}>{label}</div>
    <div className={cx(kpi.value, tone ?? 'text-report-ink')}>
      {value}
      {unit ? <small className={kpi.unit}> {unit}</small> : null}
    </div>
    {sub ? <div className={kpi.sub}>{sub}</div> : null}
  </div>
);

/** KPI for an average duration — switches to hours when large. */
export const DurationKpi = ({ label, mins, sub }: { label: string; mins: number | null; sub: string }) => {
  const { value, unit } = formatDuration(mins);
  return <KpiCard label={label} value={value} unit={unit || undefined} sub={sub} />;
};

export const SlaDeltaPill = ({ delta }: { delta: number | null }) => {
  if (delta == null) return <span className={pill.muted}>—</span>;
  const early = delta >= 0;
  return (
    <span className={cx(pill.base, 'px-2 py-0.5', early ? pill.early : pill.late)}>
      {formatMins(delta)} {early ? 'early' : 'late'}
    </span>
  );
};

export const VerdictPill = ({ perf }: { perf: ServicePerf }) => {
  if (perf.onTime == null) return <span className={pill.muted}>in progress</span>;
  return (
    <span className={cx(pill.base, 'px-2.5 py-1', perf.onTime ? pill.early : pill.late)}>
      {perf.onTime ? `${formatMins(perf.verdict ?? 0)} before SLA` : `over by ${formatMins(perf.verdict ?? 0)}`}
    </span>
  );
};

export const RatingCell = ({ rating, feedback }: { rating: number | null; feedback: string }) => {
  if (rating == null) return <span className="text-[11px] text-report-faint">— no review</span>;
  return (
    <div className="max-w-[150px]">
      <span className="inline-flex items-center gap-1 font-semibold text-report-warn">
        <Star className="h-3.5 w-3.5 fill-current" />
        {rating}
      </span>
      {feedback ? (
        <div className="mt-0.5 truncate text-[11px] text-report-muted" title={feedback}>
          {feedback}
        </div>
      ) : null}
    </div>
  );
};

export const EscalationCell = ({ escalated, level, crossedSla }: { escalated: boolean; level: number | null; crossedSla: boolean }) => {
  if (!escalated)
    return (
      <span className="inline-flex items-center rounded-full bg-report-good-bg px-2 py-0.5 text-[10px] font-semibold text-report-good">
        On track
      </span>
    );
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center rounded-full border border-report-bad-line bg-report-bad-bg px-2 py-0.5 text-[10px] font-semibold text-report-bad">
        Escalated{level != null ? ` · rank ${level}` : ''}
      </span>
      {crossedSla ? <span className="text-[10px] text-report-bad">crossed SLA</span> : null}
    </div>
  );
};

export const FilterChip = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={cx(chip.base, active ? chip.on : chip.off, disabled && 'pointer-events-none opacity-40')}
  >
    {children}
  </button>
);

export const SortableHeader = ({
  label,
  sortKey,
  activeKey,
  dir,
  numeric,
  onSort,
}: {
  label: string;
  sortKey: RequestSortKey;
  activeKey: RequestSortKey;
  dir?: 1 | -1;
  numeric?: boolean;
  onSort: (key: RequestSortKey) => void;
}) => {
  const active = activeKey === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      title="Click to sort"
      className={cx(th, numeric ? 'text-right' : 'text-left', active ? 'text-report-accent' : 'text-report-muted hover:text-report-ink')}
    >
      <span className={cx('inline-flex items-center gap-1 whitespace-nowrap', numeric && 'flex-row-reverse')}>
        {label}
        {active ? (
          dir === 1 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
        )}
      </span>
    </th>
  );
};

export const StaffBar = ({ stat, active, onClick }: { stat: StaffStat; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      'mb-2 flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-report-soft',
      active && 'bg-report-accent-bg',
    )}
  >
    <span className={cx('w-[110px] truncate text-left', active ? 'font-semibold text-report-accent' : 'text-report-muted')}>
      {stat.name}
    </span>
    <span className={bar.track}>
      <span className={cx(bar.fill, 'bg-report-good')} style={{ width: `${(stat.onTime / stat.total) * 100}%` }} />
      <span className={cx(bar.fill, 'bg-report-bad')} style={{ width: `${(stat.late / stat.total) * 100}%` }} />
    </span>
    <span className="w-[70px] text-right font-semibold tabular-nums">
      {Math.round(stat.pct)}% <span className="text-report-faint">· {stat.total}</span>
    </span>
  </button>
);

export const ServiceBar = ({ stat, maxMins, onClick }: { stat: ServiceStat; maxMins: number; onClick: () => void }) => {
  const over = stat.avgMins > stat.slaMins;
  return (
    <button type="button" onClick={onClick} className="mb-2 flex w-full items-center gap-2.5 text-xs">
      <span className="w-[120px] truncate text-left text-report-muted">{stat.service}</span>
      <span className={bar.track}>
        <span className={cx(bar.fill, over ? 'bg-report-bad' : 'bg-report-accent')} style={{ width: `${(stat.avgMins / maxMins) * 100}%` }} />
      </span>
      <span className={cx('w-[64px] text-right font-semibold tabular-nums', over ? 'text-report-bad' : 'text-report-ink')}>
        {formatMins(stat.avgMins)}
      </span>
    </button>
  );
};

export const Donut = ({ pct, label }: { pct: number; label: string }) => (
  <div
    className="relative h-[118px] w-[118px] flex-shrink-0 rounded-full"
    style={{ background: `conic-gradient(${GOOD_HEX} 0deg ${(pct / 100) * 360}deg, ${BAD_HEX} ${(pct / 100) * 360}deg 360deg)` }}
  >
    <div className="absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-white">
      <div className="font-fraunces text-lg font-semibold leading-none text-report-good">{label}</div>
      <div className="text-[10px] text-report-muted">on time</div>
    </div>
  </div>
);

export const MiniStat = ({ label, value, tone, last }: { label: string; value: ReactNode; tone?: string; last?: boolean }) => (
  <div className={cx('flex items-center justify-between py-1.5 text-xs', !last && 'border-b border-report-line')}>
    <span>{label}</span>
    <b className={tone}>{value}</b>
  </div>
);

export const ImportanceBadge = ({ importance }: { importance: GuestImportance }) => {
  const { visits, avgRating } = importance;
  // Repeat guests get a gentle accent; first-timers stay neutral. No hard tiers.
  const tone = visits > 1 ? 'bg-report-accent-bg text-report-accent ring-report-accent-line' : 'bg-slate-100 text-slate-500 ring-slate-200';
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1', tone)}>
      {visits} visit{visits === 1 ? '' : 's'}
      {avgRating != null ? <span className="opacity-80">· ★{avgRating}</span> : null}
    </span>
  );
};

export const LeaderRow = ({ rank, stat }: { rank: number; stat: StaffStat }) => (
  <div className="flex items-center gap-2 border-b border-report-line py-1.5 text-xs last:border-none">
    <span className="w-[18px] font-fraunces text-report-faint">{rank}</span>
    <span className="flex-1 font-medium">{stat.name}</span>
    <span
      className={cx(
        'font-semibold tabular-nums',
        stat.pct >= 80 ? 'text-report-good' : stat.pct >= 60 ? 'text-report-warn' : 'text-report-bad',
      )}
    >
      {Math.round(stat.pct)}%
    </span>
    <span className="text-report-faint">{stat.total} req</span>
  </div>
);
