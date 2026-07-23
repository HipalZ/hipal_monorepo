import LoadingSpinner from '@/components/atom/loadingSpinner';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import { useCheckoutTaskHistory } from '@/components/store/hotel/useCheckoutTasks';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { useUsersAnalyticsData } from '@/hooks/hotel/useUserData';
import { ArrowLeft, Download, Search, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { buildRows, groupBy, summarize, verdictText } from './analytics';
import { ANY, activeTags, applyFilters, blankFilters, clearFilter, filterOptions, type UnifiedFilters } from './filters';
import type { Source, UnifiedRow } from './model';

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
      {stats.length > 0 ? <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{stats.length}</span> : null}
    </div>
    {/* Fixed height with internal scroll — a long list must not push the log down. */}
    <div className="mt-3 max-h-[248px] space-y-2 overflow-y-auto pr-1">
      {stats.length ? (
        stats.map((s) => (
          <div key={s.key} className="p-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate font-semibold text-slate-800">{s.key}</span>
              <span className="shrink-0 font-bold tabular-nums text-slate-700">
                {Math.round(s.pct)}% <span className="font-normal text-slate-400">· {s.total}</span>
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

/** Request type — a guest service request vs a checkout turnover. */
const SourceTag = ({ source }: { source: Source }) =>
  source === 'GUEST' ? (
    <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
      Service
    </span>
  ) : (
    <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
      Checkout
    </span>
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

  const [filters, setFilters] = useState<UnifiedFilters>(blankFilters);
  const setFilter = <K extends keyof UnifiedFilters>(key: K, value: UnifiedFilters[K]) => setFilters((prev) => ({ ...prev, [key]: value }));

  const allRows = useMemo(() => buildRows(historyData as never[], tasks, visitsByPhone), [historyData, tasks, visitsByPhone]);
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
  const resetKey = `${filters.source}|${rows.length}|${pageSize}`;
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
      `Guest Requests: ${summary.guest}`,
      `Checkout Turnover: ${summary.checkout}`,
      `Within SLA: ${summary.onTimeRate == null ? '—' : `${summary.onTimeRate}%`} (${summary.onTime} of ${summary.judged})`,
      `Still Open: ${summary.open}`,
      `Escalated: ${summary.escalated}`,
      `Avg Time to Accept (min): ${round(summary.avgAccept)}`,
      `Avg Time to Complete (min): ${round(summary.avgComplete)}`,
      `Date Range: ${dateTime(from)} to ${dateTime(to)}`,
      `Generated At: ${dateTime(Date.now())}`,
      '--------------------------------------------',
    ];

    const head = [
      'Raised By',
      'Requester Type',
      'Operator (Staff)',
      'Guest Name',
      'Guest Number',
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
    ];

    const bodyRows = rows.map((r: UnifiedRow) =>
      [
        r.requesterName,
        r.requesterKind,
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
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Kpi
                label="Within SLA"
                value={summary.onTimeRate == null ? '—' : summary.onTimeRate}
                unit={summary.onTimeRate == null ? undefined : '%'}
                tone={summary.onTimeRate == null ? undefined : summary.onTimeRate >= 80 ? 'text-emerald-600' : 'text-[#8a2f2f]'}
                sub={summary.judged ? `${summary.onTime} of ${summary.judged} delivered` : 'no delivered requests'}
              />
              <Kpi label="Requests" value={summary.total} sub={`${summary.guest} guest · ${summary.checkout} checkout`} />
              <Kpi label="Avg time to accept" value={fmt(summary.avgAccept)} sub="from raise to a staff claim" />
              <Kpi label="Avg time to complete" value={fmt(summary.avgComplete)} sub="from accept to done" />

              <Kpi
                label="Escalated"
                value={summary.escalated}
                tone={summary.escalated ? 'text-[#8a2f2f]' : 'text-emerald-600'}
                sub={`${summary.open} still open`}
              />
            </section>

            {/* Filters — one cohesive bar; source segment lives here, not the header */}
            <section className={`${card} space-y-3 p-3`}>
              <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
                {/* Source segment */}
                <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
                  {(['ALL', 'GUEST', 'CHECKOUT'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilter('source', s)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${filters.source === s ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {s === 'ALL' ? 'All' : s === 'GUEST' ? 'Service' : 'Checkout'}
                    </button>
                  ))}
                </div>

                <span className="mx-1 h-5 w-px bg-slate-200" />

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
                  <p className="text-xs text-slate-500">
                    Guest requests and checkout turnover together. Guest-only fields read “—” on checkout rows.
                  </p>
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
                      <th className={th}>Handled by</th>
                      <th className={th}>To accept</th>
                      <th className={th}>To complete</th>
                      <th className={th}>Total</th>
                      <th className={`${th} text-right`}>SLA result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((r) => (
                      <tr key={`${r.source}-${r.id}`} className="hover:bg-slate-50">
                        {/* Identity: name + lifetime visits + kind. Deep guest detail lives in the Guest Experience report. */}
                        {/* Who performed the action: the guest for a guest request, the
                            front-office staff for a checkout. The CHECKOUT tag already says
                            it's a checkout, so no redundant "checked out by" line. */}
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
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <SourceTag source={r.source} />
                            {/* A guest request raised by front office on the guest's behalf. */}
                            {r.source === 'GUEST' && r.operatorName ? <span className="text-[11px] text-slate-400">via {r.operatorName}</span> : null}
                          </div>
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
                          <div className="text-[11px] text-slate-400">{r.guestPhone || '—'}</div>
                        </td>
                        <td className={`${td} font-bold text-slate-900`}>{r.room}</td>
                        <td className={td}>
                          <div className="font-medium text-slate-800">{r.service}</div>
                          <div className="text-xs text-slate-400">{clock(r.raisedAt)}</div>
                        </td>
                        {/* Accepter and completer can be different people — show both. */}
                        <td className={td}>
                          <div>
                            <span className="text-[11px] text-slate-400">Acc </span>
                            {r.acceptedByName || <span className="text-slate-300">—</span>}
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-400">Done </span>
                            <span className="text-slate-600">{r.completedByName || '—'}</span>
                          </div>
                        </td>
                        <td className={td}>
                          <div className="font-semibold tabular-nums">{fmt(r.acceptMins)}</div>
                          <div className="text-[11px] text-slate-400">SLA {r.acceptSla}m</div>
                        </td>
                        <td className={td}>
                          <div className="font-semibold tabular-nums">{fmt(r.deliverMins)}</div>
                          <div className="text-[11px] text-slate-400">{r.deliverSla ? `SLA ${r.deliverSla}m` : '—'}</div>
                        </td>
                        <td className={td}>
                          <div className="font-semibold tabular-nums">{fmt(r.totalMins)}</div>
                          <div className="text-[11px] text-slate-400">SLA {r.totalSla}m</div>
                        </td>
                        {/* Outcome cluster: the SLA verdict, with escalation as the status that belongs beside it */}
                        <td className={`${td} text-right`}>
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${r.onTime == null ? 'border-slate-200 bg-slate-50 text-slate-500' : r.onTime ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[#e3c4c4] bg-[#f7eded] text-[#8a2f2f]'}`}
                          >
                            {verdictText(r)}
                          </span>
                          {r.escalated ? (
                            <div className="mt-1 text-[10px] font-bold text-[#8a2f2f]">
                              Escalated{escalationCause(r) ? ` · ${escalationCause(r)}` : ''}
                            </div>
                          ) : null}
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
