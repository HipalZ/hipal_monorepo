import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { downloadGuestExperienceCsv, isWithinMonthLimit, MAX_REPORT_MONTHS } from './download';
import { formatMins } from './format';
import { PAGE_SIZES, SHOW_ALL, useReportData, useRequestLog } from './hooks';
import { card, cx, onTimeTone, sectionSub, sectionTitle, td, th } from './styles';
import {
  Donut,
  DurationKpi,
  EscalationCell,
  FilterChip,
  ImportanceBadge,
  KpiCard,
  LeaderRow,
  LiveBadge,
  MiniStat,
  NoteBanner,
  RatingCell,
  ServiceBar,
  SlaDeltaPill,
  SortableHeader,
  StaffBar,
  VerdictPill,
} from './ui';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'staff', label: 'Staff' },
  { id: 'services', label: 'Services' },
  { id: 'requests', label: 'Requests' },
  { id: 'guests', label: 'Guests' },
] as const;
type TabKey = (typeof TABS)[number]['id'];

const launchCard =
  'group flex w-full items-center justify-between rounded-lg border border-report-line px-3 py-2.5 text-left transition-colors hover:border-report-accent-line hover:bg-report-soft';
const launchLabel = 'text-[10px] font-semibold uppercase tracking-wide text-report-faint';
const launchTitle = 'font-fraunces text-base font-semibold';
const launchSub = 'text-[11px] text-report-muted';
const launchArrow = 'text-report-accent-line transition-colors group-hover:text-report-accent';

const GuestServiceJourney = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const from = useTimings((s) => s.timeStampStart);
  const to = useTimings((s) => s.timeStampEnd);

  const { rows, isLoading, summary, staffStats, serviceStats, donut, leaders, guests } = useReportData();
  const log = useRequestLog(rows);

  const [tab, setTab] = useState<TabKey>('overview');

  const canDownload = isWithinMonthLimit(from, to);
  const download = useMutation({
    mutationFn: downloadGuestExperienceCsv,
    onSuccess: () => toast.success('Guest experience report downloaded.'),
    onError: (error: unknown) => toast.error(error instanceof Error && error.message ? error.message : 'Failed to download guest experience report.'),
  });

  const onDownload = useCallback(() => {
    if (!rows.length) return toast.error('No data available to download.');
    if (!canDownload) return toast.error(`Cannot download more than ${MAX_REPORT_MONTHS} months at a time.`);
    download.mutate({ businessId, from, to });
  }, [rows.length, canDownload, download, businessId, from, to]);

  const serviceMax = Math.max(1, ...serviceStats.map((s) => Math.max(s.avgMins, s.slaMins)));
  const topStaff = staffStats[0];
  const slowestService = serviceStats[0];
  const topGuest = guests[0];

  return (
    <div className="bg-report-bg font-inter text-report-ink min-h-screen pb-24">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Guest Experience Report" leftIcon={<ArrowLeft />} onBack={() => navigate(-1)} />
      </header>

      <section className="mx-auto max-w-[1200px] px-4 py-5 md:px-6">
        {/* Brand + live (persistent) */}
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-report-accent font-fraunces flex h-10 w-10 items-center justify-center rounded-[11px] text-lg font-semibold text-white">
              G
            </div>
            <div>
              <h1 className="font-fraunces text-[20px] font-semibold leading-none">Guest Experience</h1>
              <p className="text-report-muted mt-1 text-xs">Front-office &amp; room service · one live view of every request</p>
            </div>
          </div>
          <LiveBadge />
        </div>
        <p className="text-report-muted mb-4 text-xs">Every request measured against its acceptance &amp; delivery SLA</p>

        {/* Controls (persistent) */}
        <div className={cx(card, 'mb-4 p-4')}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <DateRangePicker />
            <button
              type="button"
              onClick={onDownload}
              disabled={download.isPending || isLoading || !rows.length}
              className="bg-report-accent disabled:bg-report-line-strong disabled:text-report-faint inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#822a53] disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {download.isPending ? 'Preparing Report…' : 'Download Report'}
            </button>
          </div>
          <NoteBanner canDownload={canDownload} months={MAX_REPORT_MONTHS} />
        </div>

        {/* Tabs */}
        <div className="border-report-line mb-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cx(
                '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-[13.5px] font-medium transition-colors',
                tab === t.id ? 'border-report-accent text-report-accent' : 'text-report-muted hover:text-report-ink border-transparent',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <>
            <div className={cx(card, 'mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-xs text-report-muted')}>
              <span className="font-semibold text-report-ink">SLA terms</span>
              <span>Response: raised to accepted</span>
              <span>Fulfillment: accepted to completed</span>
              <span>Total: raised to completed</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              <KpiCard
                hero
                label="On-time rate"
                tone={onTimeTone(summary.onTimeRate)}
                value={
                  summary.onTimeRate == null ? (
                    '—'
                  ) : (
                    <>
                      {summary.onTimeRate}
                      <small className="text-report-faint text-[13px]">%</small>
                    </>
                  )
                }
                sub={summary.judged ? `${summary.onTimeCount} of ${summary.judged} within SLA` : 'awaiting delivered requests'}
              />
              <DurationKpi
                label="Avg time to accept"
                mins={summary.avgAccept}
                sub={summary.avgAcceptSla == null ? 'no SLA set' : `SLA target ${formatMins(summary.avgAcceptSla)}`}
              />
              <DurationKpi
                label="Avg fulfillment time"
                mins={summary.avgDeliver}
                sub={summary.avgDeliverSla == null ? 'no SLA set' : `SLA target ${formatMins(summary.avgDeliverSla)}`}
              />
              <KpiCard label="Requests handled" value={summary.requests} sub={`${summary.guests} guest${summary.guests === 1 ? '' : 's'}`} />
              <KpiCard
                label="Escalations"
                value={summary.breaches}
                tone={summary.breaches ? 'text-report-bad' : 'text-report-good'}
                sub={summary.judged ? `of ${summary.judged} delivered` : 'no delivered requests'}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* On-time mix */}
              <div className={cx(card, 'p-[18px]')}>
                <h3 className={sectionTitle}>On-time mix</h3>
                <p className={cx(sectionSub, 'mb-3 mt-0.5')}>All requests this period</p>
                <div className="flex items-center gap-4">
                  <Donut pct={donut.pct ?? 0} label={summary.onTimeRate == null ? '—' : `${summary.onTimeRate}%`} />
                  <div className="text-xs">
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="bg-report-good h-2.5 w-2.5 rounded-sm" />
                      On time {donut.onTime}
                    </div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <span className="bg-report-bad h-2.5 w-2.5 rounded-sm" />
                      Missed {donut.missed}
                    </div>
                  </div>
                </div>
                <div className="border-report-line mt-3.5 border-t pt-2.5">
                  <MiniStat label="Accept-stage misses" value={donut.acceptMisses} />
                  <MiniStat label="Fulfillment misses" value={donut.deliverMisses} />
                  <MiniStat label="Escalations" value={summary.breaches} tone={summary.breaches ? 'text-report-bad' : 'text-report-good'} last />
                </div>
              </div>

              {/* Launchpad — the headline from each area */}
              <div className={cx(card, 'p-[18px]')}>
                <h3 className={sectionTitle}>Where to look</h3>
                <p className={cx(sectionSub, 'mb-3 mt-0.5')}>The headline from each area — tap to open it.</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => setTab('staff')} className={launchCard}>
                    <div>
                      <div className={launchLabel}>Top performer</div>
                      <div className={launchTitle}>{topStaff?.name ?? '—'}</div>
                      <div className={launchSub}>
                        {topStaff ? `${Math.round(topStaff.pct)}% on time · ${topStaff.total} requests` : 'no data yet'}
                      </div>
                    </div>
                    <span className={launchArrow}>›</span>
                  </button>
                  <button type="button" onClick={() => setTab('services')} className={launchCard}>
                    <div>
                      <div className={launchLabel}>Keep an eye on</div>
                      <div className={launchTitle}>{slowestService?.service ?? '—'}</div>
                      <div className={launchSub}>
                        {slowestService ? `avg fulfillment ${formatMins(slowestService.avgMins)} vs ${formatMins(slowestService.slaMins)} SLA` : 'no data yet'}
                      </div>
                    </div>
                    <span className={launchArrow}>›</span>
                  </button>
                  <button type="button" onClick={() => setTab('guests')} className={launchCard}>
                    <div>
                      <div className={launchLabel}>Standout guest</div>
                      <div className={launchTitle}>{topGuest?.name ?? '—'}</div>
                      <div className={launchSub}>
                        {topGuest
                          ? `${topGuest.visits} visit${topGuest.visits === 1 ? '' : 's'}${topGuest.avgRating != null ? ` · ★ ${topGuest.avgRating}` : ''}`
                          : 'no data yet'}
                      </div>
                    </div>
                    <span className={launchArrow}>›</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STAFF ────────────────────────────────────────────────── */}
        {tab === 'staff' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className={cx(card, 'p-[18px]')}>
              <h3 className={sectionTitle}>Staff on-time performance</h3>
              <p className={cx(sectionSub, 'mb-3 mt-1')}>
                Each bar is that staff's requests — <span className="text-report-good">green met SLA</span>,{' '}
                <span className="text-report-bad">red missed</span>. Click one to see their requests.
              </p>
              {staffStats.length === 0 ? (
                <p className="text-report-faint text-xs">No delivered requests with SLA data yet.</p>
              ) : (
                staffStats.map((stat) => (
                  <StaffBar
                    key={stat.name}
                    stat={stat}
                    active={log.staffFilter === stat.name}
                    onClick={() => {
                      log.setStaffFilter(log.staffFilter === stat.name ? null : stat.name);
                      setTab('requests');
                    }}
                  />
                ))
              )}
              <div className="text-report-muted mt-1.5 flex gap-3.5 text-[11px]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-report-good h-2.5 w-2.5 rounded-sm" />
                  Within SLA
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="bg-report-bad h-2.5 w-2.5 rounded-sm" />
                  Missed SLA
                </span>
              </div>
            </div>

            <div className={cx(card, 'p-[18px]')}>
              <h3 className={sectionTitle}>Fastest crew</h3>
              <p className={cx(sectionSub, 'mb-3 mt-0.5')}>By on-time rate · min 3 requests</p>
              {leaders.length === 0 ? (
                <p className="text-report-faint text-xs">Not enough requests yet.</p>
              ) : (
                leaders.map((stat, i) => <LeaderRow key={stat.name} rank={i + 1} stat={stat} />)
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES ─────────────────────────────────────────────── */}
        {tab === 'services' && (
          <div className={cx(card, 'p-[18px]')}>
            <h3 className={sectionTitle}>Where time is lost, by service</h3>
            <p className={cx(sectionSub, 'mb-3 mt-0.5')}>Avg fulfillment time vs each service completion SLA — click a service for its slowest requests.</p>
            {serviceStats.length === 0 ? (
              <p className="text-report-faint text-xs">No data.</p>
            ) : (
              serviceStats.map((stat) => (
                <ServiceBar
                  key={stat.service}
                  stat={stat}
                  maxMins={serviceMax}
                  onClick={() => log.setDrillService(log.drillService === stat.service ? null : stat.service)}
                />
              ))
            )}
            {log.drillService && log.drillRows.length > 0 ? (
              <div className="border-report-line-strong mt-3 border-t border-dashed pt-2.5">
                <div className="mb-1 text-xs font-semibold">
                  {log.drillService} — completion SLA {formatMins(log.drillRows[0].perf.deliverSla)} · slowest first
                </div>
                {log.drillRows.map((row, i) => (
                  <div key={i} className="border-report-line flex items-center justify-between border-b py-1.5 text-xs last:border-none">
                    <span>
                      {row.guestName} <span className="text-report-faint">· {row.acceptedByStaff || '—'}</span>
                    </span>
                    <b className={cx('tabular-nums', row.perf.deliverDelta != null && row.perf.deliverDelta >= 0 ? 'text-report-good' : 'text-report-bad')}>
                      {row.perf.deliverMins == null ? '—' : formatMins(row.perf.deliverMins)}
                      {row.perf.deliverDelta != null && row.perf.deliverDelta < 0
                        ? ` · ${formatMins(row.perf.deliverDelta)} late`
                        : row.perf.deliverDelta != null && row.perf.deliverDelta >= 0
                          ? ' ✓'
                          : ''}
                    </b>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* ── REQUESTS ─────────────────────────────────────────────── */}
        {tab === 'requests' && (
          <div className={cx(card, 'p-[18px]')}>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <h3 className={sectionTitle}>
                Request log{' '}
                <span className="text-report-faint text-[11px] font-normal">
                  · {log.total} request{log.total === 1 ? '' : 's'}
                  {log.staffFilter ? ` · ${log.staffFilter}` : ''}
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <FilterChip active={!log.staffFilter} onClick={() => log.setStaffFilter(null)}>
                  All staff
                </FilterChip>
                {staffStats.map((stat) => (
                  <FilterChip key={stat.name} active={log.staffFilter === stat.name} onClick={() => log.setStaffFilter(stat.name)}>
                    {stat.name}
                  </FilterChip>
                ))}
              </div>
            </div>
            <p className={cx(sectionSub, 'mb-2 mt-1.5')}>
              Actual time and clock-time for each stage, with the gap to SLA. Click any column header to sort.
            </p>

            <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative w-full max-w-[320px]">
                <Search className="text-report-faint pointer-events-none absolute left-2.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2" />
                <input
                  type="search"
                  value={log.search}
                  onChange={(e) => log.setSearch(e.target.value)}
                  placeholder="Search guest, phone, room, service…"
                  className="border-report-line-strong focus:border-report-accent-soft w-full rounded-lg border bg-white py-2 pl-8 pr-3 text-[13px] outline-none"
                />
              </div>
              <div className="text-report-muted flex items-center gap-2 text-xs">
                <span>{log.total === 0 ? '0 rows' : `${log.rangeStart}–${log.rangeEnd} of ${log.total}`}</span>
                <label htmlFor="gej-size">Rows</label>
                <select
                  id="gej-size"
                  value={log.pageSize}
                  onChange={(e) => log.setPageSize(Number(e.target.value))}
                  className="border-report-line-strong focus:border-report-accent-soft rounded-lg border bg-white px-2 py-1.5 text-[13px] outline-none"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  <option value={SHOW_ALL}>All</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-report-muted py-14 text-center text-sm">Loading guest experience data…</div>
            ) : rows.length === 0 ? (
              <div className="text-report-muted py-14 text-center text-sm font-semibold">No guest experience data for the selected range.</div>
            ) : log.total === 0 ? (
              <div className="text-report-muted flex flex-col items-center gap-2 py-14 text-center text-sm">
                <p className="font-semibold">No rows match your filters.</p>
                <FilterChip
                  active={false}
                  onClick={() => {
                    log.setSearch('');
                    log.setStaffFilter(null);
                  }}
                >
                  Clear filters
                </FilterChip>
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
                <table className="w-full min-w-[1650px] border-collapse text-xs">
                  <thead>
                    <tr>
                      <SortableHeader label="Guest" sortKey="guest" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader label="Room" sortKey="room" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader label="Service" sortKey="service" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader label="Accepted by" sortKey="acceptedBy" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader
                        label="Time to accept"
                        sortKey="acceptMins"
                        activeKey={log.sortKey}
                        dir={log.sortDir}
                        onSort={log.toggleSort}
                        numeric
                      />
                      <SortableHeader
                        label="Accept vs SLA"
                        sortKey="acceptDelta"
                        activeKey={log.sortKey}
                        dir={log.sortDir}
                        onSort={log.toggleSort}
                        numeric
                      />
                      <SortableHeader label="Completed by" sortKey="deliveredBy" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader
                        label="Fulfillment time"
                        sortKey="deliverMins"
                        activeKey={log.sortKey}
                        dir={log.sortDir}
                        onSort={log.toggleSort}
                        numeric
                      />
                      <SortableHeader
                        label="Fulfillment vs SLA"
                        sortKey="deliverDelta"
                        activeKey={log.sortKey}
                        dir={log.sortDir}
                        onSort={log.toggleSort}
                        numeric
                      />
                      <SortableHeader label="Overall" sortKey="verdict" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} numeric />
                      <SortableHeader label="Escalation" sortKey="escalation" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                      <SortableHeader label="Rating" sortKey="rating" activeKey={log.sortKey} dir={log.sortDir} onSort={log.toggleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {log.pageRows.map((row, index) => {
                      const { perf } = row;
                      const key = `${row.guestPhone}-${row.acceptedAt}-${log.rowKeyOffset + index}`;
                      return (
                        <tr key={key} className="hover:bg-report-soft">
                          <td className={td}>
                            <div className="font-semibold">{row.guestName}</div>
                            <div className="text-report-muted text-[11px]">{row.guestPhone || 'No number'}</div>
                            <div className="mt-1">
                              <ImportanceBadge importance={row.importance} />
                            </div>
                          </td>
                          <td className={td}>
                            <span className="bg-report-accent-bg text-report-accent inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold">
                              {row.roomNo || '—'}
                            </span>
                          </td>
                          <td className={cx(td, 'max-w-[200px]')}>
                            <div className="font-medium">{row.serviceRequested || '-'}</div>
                            {row.orderItems ? (
                              <div className="text-report-faint truncate text-[11px]" title={row.orderItems}>
                                {row.orderItems}
                              </div>
                            ) : null}
                          </td>
                          <td className={td}>{row.acceptedByStaff || '—'}</td>
                          <td className={cx(td, 'text-right')}>
                            <div className="font-semibold tabular-nums">{perf.acceptMins == null ? '—' : formatMins(perf.acceptMins)}</div>
                            <div className="text-report-faint text-[11px]">SLA {perf.acceptSla ? formatMins(perf.acceptSla) : '—'}</div>
                            {row.acceptedAt ? <div className="text-report-faint text-[11px]">{row.acceptedAt}</div> : null}
                          </td>
                          <td className={cx(td, 'text-right')}>
                            <SlaDeltaPill delta={perf.acceptDelta} />
                          </td>
                          <td className={td}>{row.deliveredByStaff || '—'}</td>
                          <td className={cx(td, 'text-right')}>
                            <div className="font-semibold tabular-nums">{perf.deliverMins == null ? '—' : formatMins(perf.deliverMins)}</div>
                            <div className="text-report-faint text-[11px]">SLA {perf.deliverSla ? formatMins(perf.deliverSla) : '—'}</div>
                            {row.deliveredAt ? <div className="text-report-faint text-[11px]">{row.deliveredAt}</div> : null}
                          </td>
                          <td className={cx(td, 'text-right')}>
                            <SlaDeltaPill delta={perf.deliverDelta} />
                          </td>
                          <td className={cx(td, 'text-right')}>
                            <VerdictPill perf={perf} />
                          </td>
                          <td className={td}>
                            <EscalationCell escalated={row.escalated} level={row.escalationLevel} crossedSla={row.crossedEscalationSla} />
                          </td>
                          <td className={td}>
                            <RatingCell rating={row.rating} feedback={row.feedback} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {log.totalPages > 1 ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                <span className="text-report-faint text-[11px]">
                  Page {log.page} of {log.totalPages}
                </span>
                <div className="flex gap-2">
                  <FilterChip active={false} disabled={log.page === 1} onClick={() => log.setPage(log.page - 1)}>
                    ← Prev
                  </FilterChip>
                  <FilterChip active={false} disabled={log.page === log.totalPages} onClick={() => log.setPage(log.page + 1)}>
                    Next →
                  </FilterChip>
                </div>
              </div>
            ) : null}

            <p className="text-report-faint mt-3 text-center text-[11px]">
              A request is "on time" when total actual (accept + deliver) is within total SLA. Early shown green, late shown red — the same figure
              exports to the CSV.
            </p>
          </div>
        )}

        {/* ── GUESTS ───────────────────────────────────────────────── */}
        {tab === 'guests' && (
          <div className={cx(card, 'p-[18px]')}>
            <h3 className={sectionTitle}>Guests worth knowing</h3>
            <p className={cx(sectionSub, 'mb-3 mt-0.5')}>Repeat &amp; VIP guests, their satisfaction, and who they travelled with.</p>
            {guests.length === 0 ? (
              <p className="text-report-muted py-10 text-center text-sm">No guests in the selected range.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className={cx(th, 'text-left')}>Guest</th>
                      <th className={cx(th, 'text-right')}>Visits</th>
                      <th className={cx(th, 'text-right')}>Requests</th>
                      <th className={cx(th, 'text-right')}>Avg rating</th>
                      <th className={cx(th, 'text-right')}>Companions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g) => (
                      <tr key={g.phone || g.name} className="hover:bg-report-soft">
                        <td className={td}>
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-report-faint text-[11px]">{g.phone || 'No number'}</div>
                        </td>
                        <td className={cx(td, 'text-right tabular-nums')}>{g.visits}</td>
                        <td className={cx(td, 'text-right tabular-nums')}>{g.requests}</td>
                        <td className={cx(td, 'text-right')}>
                          {g.avgRating != null ? (
                            <span className="text-report-warn font-semibold">★ {g.avgRating}</span>
                          ) : (
                            <span className="text-report-faint">—</span>
                          )}
                        </td>
                        <td className={cx(td, 'text-right tabular-nums')}>{g.companions || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default GuestServiceJourney;
