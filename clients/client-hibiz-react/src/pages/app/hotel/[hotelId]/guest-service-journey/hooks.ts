import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { fetchReviews, type reviewResponse } from '@/hooks/hotel/useReviewHook';
import { useUsersAnalyticsData } from '@/hooks/hotel/useUserData';
import {
  aggregateGuests,
  aggregateServices,
  aggregateStaff,
  buildCompanionsByPhone,
  buildImportanceByPhone,
  buildRequestRows,
  computeDonut,
  matchesSearch,
  sortValue,
  summarize,
} from './analytics';
import type { AlertItem, RequestRow, RequestSortKey } from './model';

export const PAGE_SIZES = [25, 50, 100, 200] as const;
export const SHOW_ALL = 0;
const DEFAULT_PAGE_SIZE = 50;

/**
 * Fetch the request history and derive every aggregate the report renders.
 * All heavy work is memoised on the raw rows.
 */
export const useReportData = () => {
  const { historyData = [], isPending } = useHistoryAlerts();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const from = useTimings((s) => s.timeStampStart);
  const to = useTimings((s) => s.timeStampEnd);

  // Room-scan / stay records give us who was present (and their companions),
  // independent of whether they raised a service request.
  const { userAnalyticsData } = useUsersAnalyticsData({ businessId, from: String(from), to: String(to) });
  const stays = (userAnalyticsData?.analytics ?? []) as Parameters<typeof buildCompanionsByPhone>[0];
  const companionsByPhone = useMemo(() => buildCompanionsByPhone(stays), [stays]);

  // Reviews give per-request rating + written feedback (and per-guest avg rating).
  const { data: reviews = [] } = useQuery({
    queryKey: ['guestServiceJourneyReviews', businessId, from, to],
    queryFn: () => fetchReviews({ businessId, from, to }) as unknown as Promise<reviewResponse[]>,
    enabled: Boolean(businessId && from && to),
    staleTime: 60_000,
  });

  const importanceByPhone = useMemo(
    () => buildImportanceByPhone(userAnalyticsData?.visitCountByPhone ?? {}, reviews),
    [userAnalyticsData?.visitCountByPhone, reviews],
  );

  const rows = useMemo(
    () =>
      buildRequestRows(Array.isArray(historyData) ? (historyData as AlertItem[]) : [], {
        companionsByPhone,
        reviews,
        importanceByPhone,
      }),
    [historyData, companionsByPhone, reviews, importanceByPhone],
  );

  // Staff aggregation computed once; leaders is just the ≥3-request slice of it.
  const staffStats = useMemo(() => aggregateStaff(rows), [rows]);

  return {
    rows,
    isLoading: isPending,
    staffStats,
    summary: useMemo(() => summarize(rows), [rows]),
    serviceStats: useMemo(() => aggregateServices(rows), [rows]),
    donut: useMemo(() => computeDonut(rows), [rows]),
    leaders: useMemo(() => staffStats.filter((s) => s.total >= 3), [staffStats]),
    guests: useMemo(() => aggregateGuests(rows), [rows]),
  };
};

/**
 * Client-side request-log state: staff filter → search → sort → paginate,
 * plus the service drill-down. Pagination resets whenever the visible shape
 * changes (React's "adjust state during render" pattern — no effects).
 */
export const useRequestLog = (rows: RequestRow[]) => {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [staffFilter, setStaffFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<RequestSortKey>('verdict');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [drillService, setDrillService] = useState<string | null>(null);

  const toggleSort = (key: RequestSortKey) => {
    if (sortKey === key) setSortDir((dir) => (dir === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const needle = search.trim().toLowerCase();

  const visibleRows = useMemo(() => {
    const scoped = staffFilter ? rows.filter((r) => r.acceptedByStaff === staffFilter) : rows;
    const searched = needle ? scoped.filter((r) => matchesSearch(r, needle)) : scoped;
    return [...searched].sort((a, b) => {
      const x = sortValue(a, sortKey);
      const y = sortValue(b, sortKey);
      const cmp = typeof x === 'string' ? x.localeCompare(y as string, undefined, { numeric: true }) : x - (y as number);
      return cmp * sortDir;
    });
  }, [rows, staffFilter, needle, sortKey, sortDir]);

  const resetKey = `${needle}|${pageSize}|${rows.length}|${staffFilter ?? ''}|${sortKey}|${sortDir}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const total = visibleRows.length;
  const effectivePageSize = pageSize === SHOW_ALL ? Math.max(total, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * effectivePageSize;
    return visibleRows.slice(start, start + effectivePageSize);
  }, [visibleRows, currentPage, effectivePageSize]);

  const drillRows = useMemo(
    () =>
      drillService
        ? rows
            .filter((r) => r.serviceRequested === drillService)
            .sort((a, b) => (a.perf.verdict ?? 0) - (b.perf.verdict ?? 0))
            .slice(0, 4)
        : [],
    [drillService, rows],
  );

  return {
    // filters
    search,
    setSearch,
    staffFilter,
    setStaffFilter,
    // sort
    sortKey,
    sortDir,
    toggleSort,
    // drill
    drillService,
    setDrillService,
    drillRows,
    // pagination
    pageSize,
    setPageSize,
    page: currentPage,
    setPage,
    pageRows,
    total,
    totalPages,
    rowKeyOffset: (currentPage - 1) * effectivePageSize,
    rangeStart: total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1,
    rangeEnd: Math.min(currentPage * effectivePageSize, total),
  };
};
