// Reusable class-name tokens for the report. Semantic names keep the TSX
// readable and the look consistent; colours resolve to the `report-*` palette
// registered in tailwind.config.js.

/** Join truthy class fragments. */
export const cx = (...parts: Array<string | false | null | undefined>): string => parts.filter(Boolean).join(' ');

export const card = 'rounded-xl border border-report-line bg-white shadow-[0_1px_2px_rgba(50,25,50,0.04),0_3px_14px_rgba(50,25,50,0.06)]';

export const sectionTitle = 'text-sm font-semibold text-report-ink';
export const sectionSub = 'text-xs text-report-muted';

export const kpi = {
  label: 'text-[11px] text-report-muted',
  value: 'mt-1 font-fraunces text-[23px] font-semibold leading-tight',
  unit: 'text-[13px] font-normal text-report-faint',
  sub: 'mt-[3px] text-[11px] text-report-faint',
};

export const pill = {
  base: 'inline-flex items-center rounded-full border text-[11px] font-semibold tabular-nums',
  early: 'border-report-good-line bg-report-good-bg text-report-good',
  late: 'border-report-bad-line bg-report-bad-bg text-report-bad',
  muted: 'text-[11px] text-report-faint',
};

export const bar = {
  track: 'flex h-5 flex-1 overflow-hidden rounded-md bg-report-soft',
  fill: 'h-full transition-all',
};

export const chip = {
  base: 'rounded-full border px-3 py-1 text-[11px] transition-colors',
  on: 'border-report-accent bg-report-accent text-white',
  off: 'border-report-line-strong bg-white text-report-muted hover:border-report-accent-soft hover:text-report-ink',
};

export const th = 'sticky top-0 z-[1] cursor-pointer select-none whitespace-nowrap border-b border-report-line-strong bg-report-soft px-2.5 py-2.5 font-medium';
export const td = 'border-b border-report-line px-2.5 py-2.5 align-top';

/** KPI value colour by on-time health. */
export const onTimeTone = (rate: number | null): string =>
  rate == null ? 'text-report-ink' : rate >= 85 ? 'text-report-good' : rate >= 60 ? 'text-report-warn' : 'text-report-bad';
