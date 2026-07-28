import LoadingSpinner from '@/components/atom/loadingSpinner';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import { useCheckoutTaskHistory } from '@/components/store/hotel/useCheckoutTasks';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { fetchReviews, type reviewResponse } from '@/hooks/hotel/useReviewHook';
import { useUsersAnalyticsData } from '@/hooks/hotel/useUserData';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Search, Star, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { buildRows, groupBy, summarize, verdictText } from './analytics';
import { ANY, activeTags, applyFilters, blankFilters, clearFilter, filterOptions, type UnifiedFilters } from './filters';
import type { UnifiedRow } from './model';

const PAGE_SIZES = [10, 25, 50, 100] as const;

const card = 'rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_2px_10px_-3px_rgba(15,23,42,0.06)]';
const th =
  'border-b border-slate-200/80 bg-slate-50/60 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap';
const td = 'border-b border-slate-100 px-3 py-3 align-top';

/**
 * Human duration from minutes: "24s" under a minute, "1m 12s" under an hour,
 * "1h 5m" beyond. "0.4m" was impossible to read at a glance.
 */
const fmt = (m: number | null) => {
  if (m == null) return '—';
  const s = Math.round(m * 60);
  const h = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${min}m`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};
const fmtSlaResult = (m: number | null) => {
  if (m == null) return 'â€”';
  if (Math.abs(m) < 1 / 120) return 'on time';
  return `${fmt(Math.abs(m))} ${m > 0 ? 'early' : 'late'}`;
};
const slaResultTone = (m: number | null) => {
  if (m == null) return undefined;
  return m >= 0 ? 'text-emerald-600' : 'text-[#8a2f2f]';
};
const clock = (ts: number) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ts));

/**
 * Which leg blew its SLA — the reason it escalated. A request can finish within
 * its TOTAL SLA (so "early") yet still escalate because one leg (usually a slow
 * acceptance) breached, which otherwise reads as a contradiction.
 */
const escalationCause = (r: UnifiedRow): string => {
  const acceptLate = r.acceptMins != null && r.acceptMins > r.acceptSla;
  const completeLate = r.deliverMins != null && r.deliverSla > 0 && r.deliverMins > r.deliverSla;
  if (acceptLate && completeLate) return 'acceptance & completion delay';
  if (acceptLate) return 'acceptance delay';
  if (completeLate) return 'completion delay';
  return '';
};

const slaValueClass = (actual: number | null, sla: number): string => {
  if (actual == null || sla <= 0) return 'text-slate-400';
  if (actual > sla) return 'text-red-500';
  if (actual >= sla * 0.8) return 'text-amber-600';
  return 'text-emerald-600';
};

/**
 * Borderless select — the filter bar owns one border, not each dropdown. Uses
 * the browser's own dropdown arrow (a single native one), so there's no second
 * custom chevron to double up with it.
 */
const Select = ({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
}) => (
  <div className="flex items-center rounded-lg px-1 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-[170px] cursor-pointer truncate border-0 bg-transparent px-1 text-slate-600 outline-none focus:outline-none focus:ring-0"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Kpi = ({ label, value, unit, sub, tone }: { label: string; value: string | number; unit?: string; sub: string; tone?: string }) => (
  <div className={`${card} flex flex-col justify-between p-4`}>
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className={`font-fraunces mt-1 text-3xl font-bold tabular-nums ${tone ?? 'text-slate-900'}`}>
        {value}
        {unit ? <span className="text-xs font-normal text-slate-400"> {unit}</span> : null}
      </div>
    </div>
    <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">{sub}</div>
  </div>
);

const Bars = ({ title, subtitle, stats }: { title: string; subtitle: string; stats: ReturnType<typeof groupBy> }) => (
  <div className={`${card} p-5`}>
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <h3 className="font-fraunces text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      {stats.length > 0 ? (
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">{stats.length} count</span>
      ) : null}
    </div>
    {/* Fixed height with internal scroll — a long list must not push the log down. */}
    <div className="mt-3 max-h-[248px] space-y-2 overflow-y-auto pr-1">
      {stats.length ? (
        stats.map((s) => (
          <div key={s.key} className="rounded-lg p-2 transition-colors hover:bg-slate-50">
            <div className="flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 truncate font-semibold text-slate-800">
                {s.key}{' '}
                <span className="font-medium text-indigo-700">
                  - {s.total} {s.total === 1 ? 'request' : 'requests'}
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-sm font-bold tabular-nums text-slate-800 ring-1 ring-slate-200">
                {Math.round(s.pct)}%
              </span>
            </div>
            <div className="mt-1 flex h-3 w-full overflow-hidden rounded-md bg-slate-100">
              <div className="h-full bg-emerald-500" style={{ width: `${s.total ? (s.onTime / s.total) * 100 : 0}%` }} />
              <div className="h-full bg-[#a24a45]" style={{ width: `${s.total ? (s.late / s.total) * 100 : 0}%` }} />
            </div>
          </div>
        ))
      ) : (
        <p className="py-4 text-center text-xs text-slate-400">Nothing in this range.</p>
      )}
    </div>
  </div>
);

/**
 * One report over both request types. Storage stays separate — this fetches
 * the guest alert history and the checkout task history and merges them into a
 * single log. Metrics that only make sense for one type appear only when that
 * source is selected, so nothing is averaged across two different meanings.
 */
const UnifiedReport = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const from = useTimings((s) => s.timeStampStart);
  const to = useTimings((s) => s.timeStampEnd);

  const { historyData = [], isPending } = useHistoryAlerts();
  const { tasks, isLoading } = useCheckoutTaskHistory(businessId, from, to);
  // Lifetime visit count per guest phone — shown beside the guest's name.
  const { userAnalyticsData } = useUsersAnalyticsData({ businessId, from: String(from), to: String(to) });
  const visitsByPhone = userAnalyticsData?.visitCountByPhone ?? {};

  // Per-request rating + written feedback. Guest requests only — a checkout
  // turnover is never rated, so those rows stay blank.
  const { data: reviews = [] } = useQuery({
    queryKey: ['servicePerformanceReviews', businessId, from, to],
    queryFn: () => fetchReviews({ businessId, from, to }) as unknown as Promise<reviewResponse[]>,
    enabled: Boolean(businessId && from && to),
    staleTime: 60_000,
  });

  const [filters, setFilters] = useState<UnifiedFilters>(blankFilters);
  const setFilter = <K extends keyof UnifiedFilters>(key: K, value: UnifiedFilters[K]) => setFilters((prev) => ({ ...prev, [key]: value }));

  const allRows = useMemo(() => buildRows(historyData as never[], tasks, visitsByPhone, reviews), [historyData, tasks, visitsByPhone, reviews]);
  const options = useMemo(() => filterOptions(allRows), [allRows]);
  const rows = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);
  const tags = activeTags(filters);

  const summary = useMemo(() => summarize(rows), [rows]);
  const byService = useMemo(() => groupBy(rows, (r) => r.service), [rows]);
  const byStaff = useMemo(
    () =>
      groupBy(
        rows.filter((r) => r.servicedBy),
        (r) => r.servicedBy,
      ),
    [rows],
  );

  // Pagination — the log can hold a whole month, so it must not render every row.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const resetKey = `${JSON.stringify(filters)}|${rows.length}|${pageSize}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = useMemo(() => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize), [rows, currentPage, pageSize]);
  const rangeStart = rows.length ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, rows.length);

  const asOptions = (values: string[], allLabel: string) => [{ value: ANY, label: allLabel }, ...values.map((v) => ({ value: v, label: v }))];

  const onDownload = useCallback(() => {
    if (!rows.length) return toast.error('Nothing to export in this range.');

    const cell = (v: unknown) => (v == null || v === '' ? '' : /[",\n\r]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
    const round = (n: number | null) => (n == null ? '' : Math.round(n * 10) / 10);
    const dateTime = (ts?: number) =>
      ts
        ? new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }).format(new Date(ts))
        : '';
    // MoM verdict wording, matching the guest CSV's SLA Performance column.
    const slaPerformance = (r: UnifiedRow) => {
      if (r.verdict == null) return r.open ? 'In progress' : 'Not delivered';
      const v = Math.round(Math.abs(r.verdict) * 10) / 10;
      return r.onTime ? `Completed ${v} minutes before SLA` : `Exceeded SLA by ${v} minutes`;
    };

    // Summary block first (totals), matching the guest experience export.
    const summaryLines = [
      'SERVICE PERFORMANCE REPORT',
      `Total Requests: ${summary.total}`,
      `Within SLA: ${summary.onTimeRate == null ? '—' : `${summary.onTimeRate}%`} (${summary.onTime} of ${summary.judged})`,
      `Still Open: ${summary.open}`,
      `Escalated: ${summary.escalated}`,
      `Avg Time to Accept (min): ${round(summary.avgAccept)}`,
      `Avg Time to Complete (min): ${round(summary.avgComplete)}`,
      `Avg Rating: ${summary.avgRating == null ? '—' : `${summary.avgRating} (${summary.reviewed} review${summary.reviewed === 1 ? '' : 's'})`}`,
      `Date Range: ${dateTime(from)} to ${dateTime(to)}`,
      `Generated At: ${dateTime(Date.now())}`,
      '--------------------------------------------',
    ];

    const head = [
      'Raised By',
      'Operator (Staff)',
      'Guest Name',
      'Guest Phone',
      'Visit Count Till Date',
      'Room',
      'Service Requested',
      'Accepted By',
      'Completed By',
      'Requested At',
      'Acceptance Time (min)',
      'Standard Acceptance Time (min)',
      'Completion Time (min)',
      'Standard Completion Time (min)',
      'Total Time (min)',
      'Total Standard SLA (min)',
      'SLA Performance',
      'Escalated',
      'Escalation Level',
      'Rating',
      'Feedback',
    ];

    const bodyRows = rows.map((r: UnifiedRow) =>
      [
        r.requesterName,
        r.operatorName,
        r.guestName,
        r.guestPhone,
        r.visits ?? '',
        r.room,
        r.service,
        r.acceptedByName,
        r.completedByName,
        dateTime(r.raisedAt),
        round(r.acceptMins),
        r.acceptSla,
        round(r.deliverMins),
        r.deliverSla || '',
        round(r.totalMins),
        r.totalSla,
        slaPerformance(r),
        r.escalated ? (escalationCause(r) ? `Yes — ${escalationCause(r)}` : 'Yes') : 'No',
        r.escalationLevel != null ? `L${r.escalationLevel}` : '',
        r.rating ?? '',
        r.feedback,
      ]
        .map(cell)
        .join(','),
    );

    const csv = [...summaryLines, '', head.map(cell).join(','), ...bodyRows].join('\r\n');
    const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service_performance_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} request${rows.length === 1 ? '' : 's'}.`);
  }, [rows, summary, from, to]);

  const loading = isPending || isLoading;
  const showGuest = filters.source !== 'CHECKOUT';
  const showCheckout = filters.source !== 'GUEST';

  return (
    <div className="font-inter min-h-screen bg-slate-50 text-slate-800">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Service Performance Report" leftIcon={<ArrowLeft />} onBack={() => navigate(-1)} />
      </header>

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-5 md:px-6">
        {/* Controls only — the page header already names the report. */}
        <section className={`${card} flex flex-wrap items-center justify-between gap-3 p-3`}>
          <DateRangePicker />
          <button
            type="button"
            onClick={onDownload}
            disabled={loading || !rows.length}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </section>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* KPIs — shared always; type-specific only when a single source is in view */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Kpi
                label="Within SLA"
                value={summary.onTimeRate == null ? '—' : summary.onTimeRate}
                unit={summary.onTimeRate == null ? undefined : '%'}
                tone={summary.onTimeRate == null ? undefined : summary.onTimeRate >= 80 ? 'text-emerald-600' : 'text-[#8a2f2f]'}
                sub={summary.judged ? `${summary.onTime} of ${summary.judged} delivered` : 'no delivered requests'}
              />
              <Kpi label="Requests" value={summary.total} sub="service activity in range" />
              <Kpi label="Avg time to accept" value={fmt(summary.avgAccept)} sub="from raise to a staff claim" />
              <Kpi
                label="Completion SLA"
                value={fmtSlaResult(summary.avgCompleteSlaResult)}
                tone={slaResultTone(summary.avgCompleteSlaResult)}
                sub="avg result vs each service SLA"
              />
              <Kpi
                label="Avg rating"
                value={summary.avgRating == null ? '—' : summary.avgRating}
                unit={summary.avgRating == null ? undefined : '★'}
                tone={
                  summary.avgRating == null
                    ? undefined
                    : summary.avgRating >= 4
                      ? 'text-emerald-600'
                      : summary.avgRating >= 3
                        ? 'text-amber-500'
                        : 'text-[#8a2f2f]'
                }
                sub={summary.reviewed ? `${summary.reviewed} review${summary.reviewed === 1 ? '' : 's'}` : 'no reviews yet'}
              />
              <Kpi
                label="Escalated"
                value={summary.escalated}
                tone={summary.escalated ? 'text-[#8a2f2f]' : 'text-emerald-600'}
                sub={`${summary.open} still open`}
              />
            </section>

            {/* Filters — one cohesive bar for the owner-facing fields. */}
            <section className={`${card} space-y-3 p-3`}>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
                <div className="relative min-w-[180px] flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={filters.q}
                    onChange={(e) => setFilter('q', e.target.value.toLowerCase())}
                    placeholder="Search room, service, name…"
                    aria-label="Search"
                    className="w-full rounded-lg bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <Select
                  label="Outcome"
                  value={filters.outcome}
                  onChange={(v) => setFilter('outcome', v as UnifiedFilters['outcome'])}
                  options={[
                    { value: 'all', label: 'All outcomes' },
                    { value: 'ontime', label: 'Within SLA' },
                    { value: 'late', label: 'Missed SLA' },
                    { value: 'open', label: 'Still open' },
                    { value: 'escalated', label: 'Escalated' },
                  ]}
                />
                <Select
                  label="Rating"
                  value={filters.rating}
                  onChange={(v) => setFilter('rating', v as UnifiedFilters['rating'])}
                  options={[
                    { value: 'all', label: 'All ratings' },
                    { value: '5', label: '5 star' },
                    { value: '4', label: '4 star' },
                    { value: '3', label: '3 star' },
                    { value: '2', label: '2 star' },
                    { value: '1', label: '1 star' },
                    { value: 'unrated', label: 'No rating' },
                  ]}
                />
                {showGuest ? (
                  <Select
                    label="Guest"
                    value={filters.guest}
                    onChange={(v) => setFilter('guest', v)}
                    options={asOptions(options.guests, 'Any guest')}
                  />
                ) : null}
                {showCheckout ? (
                  <Select
                    label="Front office"
                    value={filters.frontOffice}
                    onChange={(v) => setFilter('frontOffice', v)}
                    options={asOptions(options.frontOffice, 'Any front office')}
                  />
                ) : null}
                <Select
                  label="Served by"
                  value={filters.staff}
                  onChange={(v) => setFilter('staff', v)}
                  options={asOptions(options.staff, 'Served by anyone')}
                />
                <Select
                  label="Service"
                  value={filters.service}
                  onChange={(v) => setFilter('service', v)}
                  options={asOptions(options.services, 'All services')}
                />
                <Select
                  label="Floor"
                  value={filters.floor}
                  onChange={(v) => setFilter('floor', v)}
                  options={asOptions(options.floors, 'All floors')}
                />
              </div>

              {(tags.length > 0 || rows.length !== allRows.length) && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400">
                      <b className="tabular-nums text-slate-700">{rows.length}</b> of {allRows.length}
                    </span>
                    {tags.map((t) => (
                      <span
                        key={`${t.key}-${t.label}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                      >
                        {t.label}
                        <button
                          type="button"
                          aria-label={`Remove ${t.label}`}
                          onClick={() => setFilters(clearFilter(filters, t.key))}
                          className="hover:text-indigo-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {tags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters(blankFilters())}
                      className="font-semibold text-slate-400 transition-colors hover:text-[#8a2f2f]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Bars title="By service" subtitle="On-time vs missed, across both request types" stats={byService} />
              <Bars title="By staff" subtitle="Who is meeting SLA on the work they do" stats={byStaff} />
            </section>

            {/* Unified log */}
            <section className={`${card} p-5`}>
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-fraunces text-base font-bold text-slate-900">Request log</h3>
                  <p className="text-xs text-slate-500">Clear view of who raised it, who handled it, and whether each SLA leg was met.</p>
                </div>
                {/* Rows + paging at the TOP so you never scroll the whole table to reach them */}
                {rows.length > 0 && (
                  <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span>Rows</span>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        aria-label="Rows per page"
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700 focus:outline-none"
                      >
                        {PAGE_SIZES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-slate-400">
                      {rangeStart}–{rangeEnd} of {rows.length}
                    </span>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPage(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="rounded-md px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <span className="px-1 tabular-nums text-slate-500">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPage(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="rounded-md px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className={th}>Raised by</th>
                      <th className={th}>Guest</th>
                      <th className={th}>Room</th>
                      <th className={th}>Service</th>
                      <th className={th}>Accepted by</th>
                      <th className={th}>Accepted at</th>
                      <th className={th}>Completed by</th>
                      <th className={th}>Completed at</th>
                      <th className={th}>Total</th>
                      <th className={th}>Rating</th>
                      <th className={`${th} text-right`}>SLA result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={`${r.source}-${r.id}`} className="hover:bg-slate-50">
                        {/* Identity: name + lifetime visits + kind. Deep guest detail lives in the Guest Experience report. */}
                        {/* Who performed the action: the guest, front-office staff, or automatic system. */}
                        <td className={td}>
                          <div className="font-semibold text-slate-900">
                            {r.requesterKind === 'AUTOMATIC' ? 'Automatic' : r.requesterName || '—'}
                            {/* Visits sit beside the guest's own name (guest requests). */}
                            {r.source === 'GUEST' && r.visits != null ? (
                              <span className="ml-1 text-xs font-normal text-slate-400">
                                · {r.visits} visit{r.visits === 1 ? '' : 's'}
                              </span>
                            ) : null}
                          </div>
                          {r.source === 'GUEST' && r.operatorName ? (
                            <div className="mt-0.5 text-[11px] text-slate-400">via {r.operatorName}</div>
                          ) : null}
                        </td>
                        {/* The guest staying — always shown, so a checkout tells you who was there. */}
                        <td className={td}>
                          <div className="font-medium text-slate-800">
                            {r.guestName || '—'}
                            {r.visits != null ? (
                              <span className="ml-1 text-xs font-normal text-slate-400">
                                · {r.visits} visit{r.visits === 1 ? '' : 's'}
                              </span>
                            ) : null}
                          </div>
                          {r.guestPhone ? <div className="mt-0.5 text-xs tabular-nums text-slate-400">{r.guestPhone}</div> : null}
                        </td>
                        <td className={`${td} font-bold text-slate-900`}>{r.room}</td>
                        <td className={td}>
                          <div className="font-medium text-slate-800">{r.service}</div>
                          <div className="text-xs text-slate-400">{clock(r.raisedAt)}</div>
                        </td>
                        {/* Accepted by name */}
                        <td className={td}>
                          <div className="font-medium text-slate-800">{r.acceptedByName || <span className="text-slate-300">—</span>}</div>
                        </td>
                        <td className={td}>
                          <div className={`font-semibold tabular-nums ${slaValueClass(r.acceptMins, r.acceptSla)}`}>{fmt(r.acceptMins)}</div>
                          <div className="text-[11px] text-slate-400">SLA {r.acceptSla}m</div>
                        </td>
                        {/* Completed by name */}
                        <td className={td}>
                          <div className="font-medium text-slate-600">{r.completedByName || '—'}</div>
                        </td>
                        <td className={td}>
                          <div className={`font-semibold tabular-nums ${slaValueClass(r.deliverMins, r.deliverSla)}`}>{fmt(r.deliverMins)}</div>
                          <div className="text-[11px] text-slate-400">{r.deliverSla ? `SLA ${r.deliverSla}m` : '—'}</div>
                        </td>
                        <td className={td}>
                          <div className={`font-semibold tabular-nums ${slaValueClass(r.totalMins, r.totalSla)}`}>{fmt(r.totalMins)}</div>
                          <div className="text-[11px] text-slate-400">SLA {r.totalSla}m</div>
                        </td>
                        {/* Guest's rating + feedback. Blank on checkout rows and unreviewed requests. */}
                        <td className={`${td} max-w-[160px]`}>
                          {r.rating != null ? (
                            <>
                              <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {r.rating}
                              </span>
                              {r.feedback ? (
                                <div className="truncate text-[11px] text-slate-400" title={r.feedback}>
                                  {r.feedback}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-300">—</span>
                          )}
                        </td>
                        {/* Outcome cluster: the SLA verdict, with escalation as the status that belongs beside it */}
                        <td className={`${td} text-right`}>
                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                r.onTime == null ? (r.open ? 'text-amber-700' : 'text-slate-500') : r.onTime ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {r.onTime == null ? null : r.onTime ? (
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              ) : (
                                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                              )}
                              {verdictText(r)}
                            </span>
                            {r.escalated ? (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Escalated{r.escalationLevel != null ? ` · L${r.escalationLevel}` : ''}
                                {escalationCause(r) ? ` · ${escalationCause(r)}` : ''}
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!rows.length ? <p className="py-10 text-center text-sm text-slate-400">No requests in this range.</p> : null}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default UnifiedReport;
