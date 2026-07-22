import DateRangePicker from '@/components/molecules/dateRangePicker';
import MemoizedHeader from '@/components/molecules/header';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { API_URL } from '@/configs';
import { fetchReviews, type reviewResponse } from '@/hooks/hotel/useReviewHook';
import { useUsersAnalyticsData } from '@/hooks/hotel/useUserData';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Search } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;
const DEFAULT_PAGE_SIZE = 50;
const MAX_REPORT_MONTHS = 3;

// Shared "boutique" card shell (palette ported from the approved prototype).
const CARD = 'rounded-xl border border-[#ece6ee] bg-white shadow-[0_1px_2px_rgba(50,25,50,0.04),0_3px_14px_rgba(50,25,50,0.06)]';

type StaffRef = { _id?: string; name?: string; phone?: string } | null | undefined;
type ServiceRef = {
  _id?: string;
  name?: string;
  avgAcceptanceTime?: number;
  avgDeliveryTime?: number;
};
type AlertItem = {
  _id?: string;
  createdAt?: number;
  acceptedAt?: number;
  deliveredAt?: number;
  alertProgress?: string;
  isEscalated?: boolean;
  level?: number;
  serviceIds?: ServiceRef[];
  roomId?: { _id?: string; name?: string };
  createdBy?: { _id?: string; name?: string; phone?: string };
  acceptedBy?: StaffRef;
  deliveredBy?: StaffRef;
  cart?: any[];
};

type JourneyRow = {
  'Guest Name': string;
  'Guest Phone': string;
  'Room No': string;
  'Visit Count Till Date': number | '';
  'Booking Source': string;
  'Check-In Date Time': string;
  'Check-Out Date Time': string;
  'Service Requested': string;
  'Order Items': string;
  'Requested At': string;
  'Accepted By Staff': string;
  'Accepted At': string;
  'Delivered By Staff': string;
  'Delivered At': string;
  'Acceptance Time': string;
  'Delivery Time': string;
  'Total Resolution Time': string;
  Escalated: 'Yes' | 'No';
  'Escalation Level': number | '';
  'Crossed Escalation SLA': 'Yes' | 'No';
  'Service Rating': number | '';
  'Review Feedback': string;
  'Reviewed At': string;
};

const getOrdinalDay = (day: number) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return '';
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(timestamp));

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  const day = Number(getPart('day'));
  return `${getOrdinalDay(day)} ${getPart('month')} ${getPart('year')}, ${getPart('hour')}:${getPart('minute')} ${getPart('dayPeriod').toUpperCase()}`;
};

const isWithinMonthLimit = (from?: number, to?: number, months = MAX_REPORT_MONTHS) => {
  if (!from || !to || to < from) return false;
  const maxDate = new Date(from);
  maxDate.setMonth(maxDate.getMonth() + months);
  return to <= maxDate.getTime();
};

const getDurationLabel = (from?: number, to?: number) => {
  if (!from || !to || to < from) return '';
  const totalMinutes = Math.round((to - from) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours ? `${hours}h` : '', minutes || !hours ? `${minutes}m` : ''].filter(Boolean).join(' ');
};

const joinNames = (items?: ServiceRef[]) =>
  items
    ?.map((item) => item?.name)
    .filter(Boolean)
    .join(', ') || '';

const staffName = (staff: StaffRef) => staff?.name || '';

const buildOrderItems = (cart?: any[]) => {
  if (!cart?.length) return '';
  return cart
    .map((item) => {
      const dishName = item?.dish?.name || item?.name || '';
      const quantity = item?.quantity ?? 1;
      const price = item?.dish?.price;
      return price !== undefined && price !== null ? `${dishName} x${quantity} (Rs ${price})` : `${dishName} x${quantity}`;
    })
    .filter(Boolean)
    .join(' | ');
};

const servicesOverlap = (alertServices?: ServiceRef[], reviewServices?: ServiceRef[]) => {
  const alertNames = new Set(alertServices?.map((service) => service?.name?.toLowerCase()).filter(Boolean));
  return Boolean(reviewServices?.some((service) => alertNames.has(service?.name?.toLowerCase())));
};

const findMatchingReview = (alert: AlertItem, reviews: reviewResponse[]) => {
  const alertId = alert?._id;
  const exact = reviews.find((review) => {
    const reviewAlertId = typeof review.alertId === 'object' && review.alertId ? review.alertId._id : undefined;
    return alertId && reviewAlertId === alertId;
  });
  if (exact) return exact;

  return reviews.find((review) => {
    const user = typeof review.userId === 'object' && review.userId ? review.userId : null;
    const sameGuest = user?.phone && user.phone === alert.createdBy?.phone;
    const sameRoom = review.roomId?.name && review.roomId.name === alert.roomId?.name;
    const reviewAlert = typeof review.alertId === 'object' && review.alertId ? review.alertId : null;
    const sameService = servicesOverlap(alert.serviceIds, reviewAlert?.serviceIds);
    const afterRequest = review.date && alert.createdAt ? review.date >= alert.createdAt : true;
    return Boolean(sameGuest && sameRoom && sameService && afterRequest);
  });
};

// ── SLA performance ───────────────────────────────────────────────────────
// Standards come from each service's avgAcceptanceTime / avgDeliveryTime
// (minutes); actuals from the request timestamps. A positive delta means the
// stage finished AHEAD of its SLA (early, good); negative means it ran late.
type ServicePerf = {
  accMin: number | null;
  delMin: number | null;
  accSla: number;
  delSla: number;
  accDelta: number | null;
  delDelta: number | null;
  totalSla: number;
  totalActual: number | null;
  verdict: number | null;
  onTime: boolean | null;
};

const computePerf = (alert: AlertItem): ServicePerf => {
  const services = alert.serviceIds ?? [];
  const accSla = services.reduce((sum, s) => sum + (s?.avgAcceptanceTime ?? 0), 0);
  const delSla = services.reduce((sum, s) => sum + (s?.avgDeliveryTime ?? 0), 0);
  const accMin = alert.acceptedAt && alert.createdAt ? (alert.acceptedAt - alert.createdAt) / 60000 : null;
  const delMin = alert.deliveredAt && alert.acceptedAt ? (alert.deliveredAt - alert.acceptedAt) / 60000 : null;
  const totalActual = alert.deliveredAt && alert.createdAt ? (alert.deliveredAt - alert.createdAt) / 60000 : null;
  const totalSla = accSla + delSla;
  const verdict = totalActual != null && totalSla > 0 ? totalSla - totalActual : null;
  return {
    accMin,
    delMin,
    accSla,
    delSla,
    accDelta: accMin != null && accSla > 0 ? accSla - accMin : null,
    delDelta: delMin != null && delSla > 0 ? delSla - delMin : null,
    totalSla,
    totalActual,
    verdict,
    onTime: verdict == null ? null : verdict >= 0,
  };
};

type PreviewRow = JourneyRow & { _perf: ServicePerf };

const buildJourneyRows = (
  alerts: AlertItem[],
  reviews: reviewResponse[],
  visitCountByPhone: Map<string, number>,
  stayByPhone: Map<string, { source?: string; checkIn?: number; checkOut?: number }>,
): PreviewRow[] =>
  alerts.map((alert) => {
    const phone = alert.createdBy?.phone || '';
    const review = findMatchingReview(alert, reviews);
    const stay = phone ? stayByPhone.get(phone) : undefined;

    return {
      'Guest Name': alert.createdBy?.name || 'Guest',
      'Guest Phone': phone,
      'Room No': alert.roomId?.name || '',
      'Visit Count Till Date': phone ? (visitCountByPhone.get(phone) ?? '') : '',
      'Booking Source': stay?.source || '',
      'Check-In Date Time': formatDateTime(stay?.checkIn),
      'Check-Out Date Time': formatDateTime(stay?.checkOut),
      'Service Requested': joinNames(alert.serviceIds),
      'Order Items': buildOrderItems(alert.cart),
      'Requested At': formatDateTime(alert.createdAt),
      'Accepted By Staff': staffName(alert.acceptedBy),
      'Accepted At': formatDateTime(alert.acceptedAt),
      'Delivered By Staff': staffName(alert.deliveredBy),
      'Delivered At': formatDateTime(alert.deliveredAt),
      'Acceptance Time': getDurationLabel(alert.createdAt, alert.acceptedAt),
      'Delivery Time': getDurationLabel(alert.acceptedAt, alert.deliveredAt),
      'Total Resolution Time': getDurationLabel(alert.createdAt, alert.deliveredAt),
      Escalated: alert.isEscalated ? 'Yes' : 'No',
      'Escalation Level': alert.isEscalated ? (alert.level ?? 0) : '',
      'Crossed Escalation SLA': alert.isEscalated ? 'Yes' : 'No',
      'Service Rating': review?.reviewRating ?? '',
      'Review Feedback': review?.note || review?.improvementAreas?.filter(Boolean).join(', ') || '',
      'Reviewed At': formatDateTime(review?.date),
      _perf: computePerf(alert),
    } satisfies PreviewRow;
  });

type DownloadReportArgs = { businessId: string; from: number; to: number };
type DownloadReportResult = { blob: Blob; filename: string };

const downloadGuestExperienceReport = async ({ businessId, from, to }: DownloadReportArgs): Promise<DownloadReportResult> => {
  const url = new URL(`${API_URL}/hotel/report/guest_experience_csv`);
  url.searchParams.set('businessId', businessId);
  url.searchParams.set('from', String(from));
  url.searchParams.set('to', String(to));

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'text/csv' },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Server responded ${res.status}`);
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const serverFilename = match?.[1];
  const filename = serverFilename || `guest_experience_report_${new Date(from || Date.now()).toISOString().slice(0, 10)}.csv`;

  const blob = await res.blob();
  return { blob, filename };
};

const triggerBlobDownload = ({ blob, filename }: DownloadReportResult) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
};

type SortKey = 'guest' | 'room' | 'svc' | 'staff' | 'delby' | 'acc' | 'accd' | 'del' | 'deld' | 'verd';

const GuestServiceJourney = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);

  const { historyData = [], isPending: isHistoryPending } = useHistoryAlerts();
  const { userAnalyticsData, isFetching: isUsersFetching } = useUsersAnalyticsData({
    businessId,
    from: String(timeStampStart),
    to: String(timeStampEnd),
  });

  const { data: reviews = [], isFetching: isReviewsFetching } = useQuery({
    queryKey: ['guestServiceJourneyReviews', businessId, timeStampStart, timeStampEnd],
    queryFn: () => fetchReviews({ businessId, from: timeStampStart, to: timeStampEnd }) as unknown as Promise<reviewResponse[]>,
    enabled: Boolean(businessId && timeStampStart && timeStampEnd),
    staleTime: 60_000,
  });

  const alerts = useMemo(() => (Array.isArray(historyData) ? (historyData as AlertItem[]) : []), [historyData]);

  const stayByPhone = useMemo(() => {
    const map = new Map<string, { source?: string; checkIn?: number; checkOut?: number }>();
    for (const stay of userAnalyticsData?.analytics ?? []) {
      const phone = stay.userId?.phone;
      if (!phone) continue;
      const current = map.get(phone);
      if (!current || (stay.checkIn || 0) > (current.checkIn || 0)) {
        map.set(phone, { source: stay.source, checkIn: stay.checkIn, checkOut: stay.checkOut });
      }
    }
    return map;
  }, [userAnalyticsData?.analytics]);

  const selectedRangeVisitCountByPhone = useMemo(() => {
    const map = new Map<string, number>();
    for (const stay of userAnalyticsData?.analytics ?? []) {
      const phone = stay.userId?.phone;
      if (!phone) continue;
      map.set(phone, (map.get(phone) ?? 0) + 1);
    }
    return map;
  }, [userAnalyticsData?.analytics]);

  const previewRows = useMemo(
    () => buildJourneyRows(alerts, reviews, selectedRangeVisitCountByPhone, stayByPhone),
    [alerts, reviews, selectedRangeVisitCountByPhone, stayByPhone],
  );

  // ── Interaction state ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [curStaff, setCurStaff] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('verd');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [drillSvc, setDrillSvc] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const staffScopedRows = useMemo(
    () => (curStaff ? previewRows.filter((r) => r['Accepted By Staff'] === curStaff) : previewRows),
    [previewRows, curStaff],
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const searchedRows = useMemo(() => {
    if (!normalizedSearch) return staffScopedRows;
    return staffScopedRows.filter((row) =>
      [row['Guest Name'], row['Guest Phone'], row['Room No'], row['Service Requested'], row['Accepted By Staff'], row['Delivered By Staff']]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [staffScopedRows, normalizedSearch]);

  const sortedRows = useMemo(() => {
    const val = (r: PreviewRow): string | number => {
      switch (sortKey) {
        case 'guest':
          return r['Guest Name'];
        case 'room':
          return r['Room No'];
        case 'svc':
          return r['Service Requested'];
        case 'staff':
          return r['Accepted By Staff'];
        case 'delby':
          return r['Delivered By Staff'];
        case 'acc':
          return r._perf.accMin ?? Number.POSITIVE_INFINITY;
        case 'accd':
          return r._perf.accDelta ?? Number.POSITIVE_INFINITY;
        case 'del':
          return r._perf.delMin ?? Number.POSITIVE_INFINITY;
        case 'deld':
          return r._perf.delDelta ?? Number.POSITIVE_INFINITY;
        case 'verd':
          return r._perf.verdict ?? Number.POSITIVE_INFINITY;
      }
    };
    return [...searchedRows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === 'string' ? x.localeCompare(y as string, undefined, { numeric: true }) : x - (y as number)) * sortDir;
    });
  }, [searchedRows, sortKey, sortDir]);

  const datasetKey = `${normalizedSearch}|${pageSize}|${previewRows.length}|${curStaff ?? ''}|${sortKey}|${sortDir}`;
  const [lastDatasetKey, setLastDatasetKey] = useState(datasetKey);
  if (datasetKey !== lastDatasetKey) {
    setLastDatasetKey(datasetKey);
    setPage(1);
  }

  const totalRows = sortedRows.length;
  // pageSize === 0 is the "All" option — show the whole filtered set on one page.
  const effPageSize = pageSize === 0 ? Math.max(totalRows, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalRows / effPageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * effPageSize;
    return sortedRows.slice(start, start + effPageSize);
  }, [sortedRows, safePage, effPageSize]);
  const rangeStart = totalRows === 0 ? 0 : (safePage - 1) * effPageSize + 1;
  const rangeEnd = Math.min(safePage * effPageSize, totalRows);

  const stats = useMemo(() => {
    const mean = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);
    const uniqueGuests = new Set(alerts.map((a) => a.createdBy?.phone).filter(Boolean)).size;
    const escalated = alerts.filter((a) => a.isEscalated).length;
    const judged = previewRows.filter((r) => r._perf.onTime !== null);
    const onTimeCount = judged.filter((r) => r._perf.onTime).length;
    return {
      requests: alerts.length,
      uniqueGuests,
      escalated,
      judgedCount: judged.length,
      onTimeCount,
      breaches: judged.length - onTimeCount,
      onTimeRate: judged.length ? Math.round((onTimeCount / judged.length) * 100) : null,
      avgAccept: mean(previewRows.map((r) => r._perf.accMin).filter((n): n is number => n != null)),
      avgDeliver: mean(previewRows.map((r) => r._perf.delMin).filter((n): n is number => n != null)),
      avgAccSla: mean(previewRows.map((r) => r._perf.accSla).filter((n) => n > 0)),
      avgDelSla: mean(previewRows.map((r) => r._perf.delSla).filter((n) => n > 0)),
    };
  }, [alerts, previewRows]);

  const staffPerf = useMemo(() => {
    const map = new Map<string, { on: number; late: number; tot: number }>();
    for (const r of previewRows) {
      if (r._perf.onTime == null) continue;
      const name = r['Accepted By Staff'] || 'Unassigned';
      const e = map.get(name) || { on: 0, late: 0, tot: 0 };
      e.tot++;
      r._perf.onTime ? e.on++ : e.late++;
      map.set(name, e);
    }
    return [...map.entries()].map(([name, v]) => ({ name, ...v, pct: v.tot ? (v.on / v.tot) * 100 : 0 })).sort((a, b) => b.pct - a.pct);
  }, [previewRows]);

  const servicePerf = useMemo(() => {
    const map = new Map<string, { sum: number; tot: number; sla: number }>();
    for (const r of previewRows) {
      const p = r._perf;
      if (p.totalActual == null) continue;
      const name = r['Service Requested'] || '—';
      const e = map.get(name) || { sum: 0, tot: 0, sla: p.totalSla };
      e.sum += p.totalActual;
      e.tot++;
      if (p.totalSla > 0) e.sla = p.totalSla;
      map.set(name, e);
    }
    const rows = [...map.entries()].map(([svc, v]) => ({ svc, avg: v.sum / v.tot, sla: v.sla, tot: v.tot }));
    rows.sort((a, b) => b.avg - b.sla - (a.avg - a.sla));
    return rows;
  }, [previewRows]);

  const donutStats = useMemo(() => {
    const judged = previewRows.filter((r) => r._perf.onTime !== null);
    const on = judged.filter((r) => r._perf.onTime).length;
    return {
      on,
      missed: judged.length - on,
      pct: judged.length ? Math.round((on / judged.length) * 100) : null,
      accMiss: previewRows.filter((r) => r._perf.accDelta != null && r._perf.accDelta < 0).length,
      delMiss: previewRows.filter((r) => r._perf.delDelta != null && r._perf.delDelta < 0).length,
      esc: alerts.filter((a) => a.isEscalated).length,
    };
  }, [previewRows, alerts]);

  const leaderboard = useMemo(() => staffPerf.filter((s) => s.tot >= 3), [staffPerf]);

  const drillRows = useMemo(
    () =>
      drillSvc
        ? previewRows
            .filter((r) => r['Service Requested'] === drillSvc)
            .sort((a, b) => (a._perf.verdict ?? 0) - (b._perf.verdict ?? 0))
            .slice(0, 4)
        : [],
    [drillSvc, previewRows],
  );

  const isLoading = isHistoryPending || isReviewsFetching || isUsersFetching;
  const canDownload = isWithinMonthLimit(timeStampStart, timeStampEnd);

  const downloadMutation = useMutation({
    mutationFn: downloadGuestExperienceReport,
    onSuccess: (result) => {
      triggerBlobDownload(result);
      toast.success('Guest experience report downloaded.');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error && error.message ? error.message : 'Failed to download guest experience report.');
    },
  });

  const handleDownload = useCallback(() => {
    if (!alerts.length) {
      toast.error('No guest experience report data available to download.');
      return;
    }
    if (!canDownload) {
      toast.error(`Cannot download more than ${MAX_REPORT_MONTHS} months of data at a time.`);
      return;
    }
    downloadMutation.mutate({ businessId, from: timeStampStart, to: timeStampEnd });
  }, [alerts.length, businessId, canDownload, downloadMutation, timeStampEnd, timeStampStart]);

  const isDownloading = downloadMutation.isPending;
  const svcMax = Math.max(1, ...servicePerf.map((s) => Math.max(s.avg, s.sla)));
  const donutPct = donutStats.pct ?? 0;

  return (
    <div className="font-inter min-h-screen bg-[#f3f0f5] pb-24 text-[#241d24]">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Guest Experience Report" leftIcon={<ArrowLeft />} onBack={() => navigate(-1)} />
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        {/* Brand / live */}
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="font-fraunces flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#9c2f61] text-lg font-semibold text-white">
              G
            </div>
            <div>
              <h1 className="font-fraunces text-[20px] font-semibold leading-none">Guest Experience</h1>
              <p className="mt-1 text-xs text-[#7c7280]">Front-office &amp; room service · one live view of every request</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3d7a17]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3d7a17] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3d7a17]" />
            </span>
            Live · updates as staff accept &amp; deliver
          </span>
        </div>
        <p className="mb-4 text-xs text-[#7c7280]">Every request measured against its acceptance &amp; delivery SLA</p>

        {/* Controls: date presets (Today / Yesterday / This Month / Custom) + download */}
        <div className={`${CARD} mb-4 p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <DateRangePicker />
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isLoading || !alerts.length}
              className="inline-flex items-center gap-2 rounded-lg bg-[#9c2f61] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#822a53] disabled:cursor-not-allowed disabled:bg-[#ded5e2] disabled:text-[#a99fae]"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Preparing Report…' : 'Download Report'}
            </button>
          </div>
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              canDownload ? 'border-[#ecc3d8] bg-[#f9e9f1] text-[#86285a]' : 'border-[#efd8a6] bg-[#f8ecd6] text-[#9a6207]'
            }`}
          >
            Guest Experience Report maps guest, room, stay date, service request, accepted &amp; delivered staff, escalation, rating, feedback, and
            visit count. Downloads support up to {MAX_REPORT_MONTHS} months at a time.
          </div>
        </div>

        {/* KPI hero */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <div className={`${CARD} p-[15px] ring-1 ring-[#ecc3d8]`}>
            <div className="text-[11px] text-[#7c7280]">On-time rate</div>
            <div className="font-fraunces mt-1 text-[23px] font-semibold leading-tight" style={{ color: onTimeColor(stats.onTimeRate) }}>
              {stats.onTimeRate == null ? '—' : stats.onTimeRate}
              {stats.onTimeRate == null ? null : <small className="text-[13px] text-[#a99fae]">%</small>}
            </div>
            <div className="mt-[3px] text-[11px] text-[#a99fae]">
              {stats.judgedCount ? `${stats.onTimeCount} of ${stats.judgedCount} within SLA` : 'awaiting delivered requests'}
            </div>
          </div>
          <Kpi
            label="Avg time to accept"
            dur={stats.avgAccept}
            sub={stats.avgAccSla == null ? 'no SLA set' : `SLA target ${fmtNum(stats.avgAccSla)} min`}
          />
          <Kpi
            label="Avg time to deliver"
            dur={stats.avgDeliver}
            sub={stats.avgDelSla == null ? 'no SLA set' : `SLA target ${fmtNum(stats.avgDelSla)} min`}
          />
          <div className={`${CARD} p-[15px]`}>
            <div className="text-[11px] text-[#7c7280]">Requests handled</div>
            <div className="font-fraunces mt-1 text-[23px] font-semibold leading-tight">{stats.requests}</div>
            <div className="mt-[3px] text-[11px] text-[#a99fae]">
              {stats.uniqueGuests} guest{stats.uniqueGuests === 1 ? '' : 's'}
            </div>
          </div>
          <div className={`${CARD} p-[15px]`}>
            <div className="text-[11px] text-[#7c7280]">SLA breaches</div>
            <div className="font-fraunces mt-1 text-[23px] font-semibold leading-tight" style={{ color: stats.breaches ? '#b23a2e' : '#3d7a17' }}>
              {stats.breaches}
            </div>
            <div className="mt-[3px] text-[11px] text-[#a99fae]">{stats.escalated} escalated</div>
          </div>
        </div>

        {/* Staff on-time bars */}
        <div className={`${CARD} mb-4 p-[18px]`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Staff on-time performance</h3>
            <span className="text-xs text-[#7c7280]">click a staff member to filter the request log below</span>
          </div>
          <p className="mb-3 mt-1 text-xs text-[#7c7280]">
            Each bar is that staff's requests — <span className="text-[#3d7a17]">green met SLA</span>,{' '}
            <span className="text-[#b23a2e]">red missed</span>. Value is their on-time rate.
          </p>
          {staffPerf.length === 0 ? (
            <p className="text-xs text-[#a99fae]">No delivered requests with SLA data yet.</p>
          ) : (
            staffPerf.map((s) => (
              <button
                type="button"
                key={s.name}
                onClick={() => setCurStaff(curStaff === s.name ? null : s.name)}
                className={`mb-2 flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 text-xs transition-colors hover:bg-[#faf7fc] ${curStaff === s.name ? 'bg-[#f9e9f1]' : ''}`}
              >
                <span className={`w-[110px] truncate text-left ${curStaff === s.name ? 'font-semibold text-[#9c2f61]' : 'text-[#7c7280]'}`}>
                  {s.name}
                </span>
                <span className="flex h-5 flex-1 overflow-hidden rounded-md bg-[#faf7fc]">
                  <span className="h-full bg-[#3d7a17] transition-all" style={{ width: `${(s.on / s.tot) * 100}%` }} />
                  <span className="h-full bg-[#b23a2e] transition-all" style={{ width: `${(s.late / s.tot) * 100}%` }} />
                </span>
                <span className="w-[70px] text-right font-semibold tabular-nums">
                  {Math.round(s.pct)}% <span className="text-[#a99fae]">· {s.tot}</span>
                </span>
              </button>
            ))
          )}
          <div className="mt-1.5 flex gap-3.5 text-[11px] text-[#7c7280]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#3d7a17]" />
              Within SLA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#b23a2e]" />
              Missed SLA
            </span>
          </div>
        </div>

        {/* 3-up */}
        <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
          {/* Where time is lost */}
          <div className={`${CARD} p-[18px]`}>
            <h3 className="text-sm font-semibold">Where time is lost, by service</h3>
            <p className="mb-3 mt-0.5 text-xs text-[#7c7280]">Avg total time vs SLA — click a service for its slowest requests.</p>
            {servicePerf.length === 0 ? (
              <p className="text-xs text-[#a99fae]">No data.</p>
            ) : (
              servicePerf.map((c) => {
                const over = c.avg > c.sla;
                return (
                  <button
                    type="button"
                    key={c.svc}
                    onClick={() => setDrillSvc(drillSvc === c.svc ? null : c.svc)}
                    className="mb-2 flex w-full items-center gap-2.5 text-xs"
                  >
                    <span className="w-[120px] truncate text-left text-[#7c7280]">{c.svc}</span>
                    <span className="flex h-5 flex-1 overflow-hidden rounded-md bg-[#faf7fc]">
                      <span
                        className="h-full transition-all"
                        style={{ width: `${(c.avg / svcMax) * 100}%`, background: over ? '#b23a2e' : '#9c2f61' }}
                      />
                    </span>
                    <span className="w-[64px] text-right font-semibold tabular-nums" style={{ color: over ? '#b23a2e' : '#241d24' }}>
                      {fmtMins(c.avg)}
                    </span>
                  </button>
                );
              })
            )}
            {drillSvc && drillRows.length > 0 ? (
              <div className="mt-3 border-t border-dashed border-[#ded5e2] pt-2.5">
                <div className="mb-1 text-xs font-semibold">
                  {drillSvc} — SLA target {fmtMins(drillRows[0]._perf.totalSla)} · slowest first
                </div>
                {drillRows.map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-[#ece6ee] py-1.5 text-xs last:border-none">
                    <span>
                      {r['Guest Name']} <span className="text-[#a99fae]">· {r['Accepted By Staff'] || '—'}</span>
                    </span>
                    <b className="tabular-nums" style={{ color: r._perf.onTime ? '#3d7a17' : '#b23a2e' }}>
                      {r._perf.totalActual == null ? '—' : fmtMins(r._perf.totalActual)}
                      {r._perf.onTime === false && r._perf.verdict != null ? ` · ${fmtMins(-r._perf.verdict)} late` : r._perf.onTime ? ' ✓' : ''}
                    </b>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* On-time mix */}
          <div className={`${CARD} p-[18px]`}>
            <h3 className="text-sm font-semibold">On-time mix</h3>
            <p className="mb-3 mt-0.5 text-xs text-[#7c7280]">All requests this period</p>
            <div className="flex items-center gap-4">
              <div
                className="relative h-[118px] w-[118px] flex-shrink-0 rounded-full"
                style={{ background: `conic-gradient(#3d7a17 0deg ${(donutPct / 100) * 360}deg, #b23a2e ${(donutPct / 100) * 360}deg 360deg)` }}
              >
                <div className="absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-white">
                  <div className="font-fraunces text-lg font-semibold leading-none text-[#3d7a17]">
                    {stats.onTimeRate == null ? '—' : `${stats.onTimeRate}%`}
                  </div>
                  <div className="text-[10px] text-[#7c7280]">on time</div>
                </div>
              </div>
              <div className="text-xs">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#3d7a17]" />
                  On time {donutStats.on}
                </div>
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#b23a2e]" />
                  Missed {donutStats.missed}
                </div>
              </div>
            </div>
            <div className="mt-3.5 border-t border-[#ece6ee] pt-2.5">
              <MiniRow label="Accept-stage misses" value={donutStats.accMiss} />
              <MiniRow label="Delivery-stage misses" value={donutStats.delMiss} />
              <MiniRow label="Escalated requests" value={donutStats.esc} color={donutStats.esc ? '#b23a2e' : '#3d7a17'} last />
            </div>
          </div>

          {/* Fastest crew */}
          <div className={`${CARD} p-[18px]`}>
            <h3 className="text-sm font-semibold">Fastest crew</h3>
            <p className="mb-3 mt-0.5 text-xs text-[#7c7280]">By on-time rate · min 3 requests</p>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-[#a99fae]">Not enough requests yet.</p>
            ) : (
              leaderboard.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2 border-b border-[#ece6ee] py-1.5 text-xs last:border-none">
                  <span className="font-fraunces w-[18px] text-[#a99fae]">{i + 1}</span>
                  <span className="flex-1 font-medium">{s.name}</span>
                  <span className="font-semibold tabular-nums" style={{ color: s.pct >= 80 ? '#3d7a17' : s.pct >= 60 ? '#9a6207' : '#b23a2e' }}>
                    {Math.round(s.pct)}%
                  </span>
                  <span className="text-[#a99fae]">{s.tot} req</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Request log */}
        <div className={`${CARD} p-[18px]`}>
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h3 className="text-sm font-semibold">
              Request log{' '}
              <span className="text-[11px] font-normal text-[#a99fae]">
                · {totalRows} request{totalRows === 1 ? '' : 's'}
                {curStaff ? ` · ${curStaff}` : ''}
              </span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <Chip active={!curStaff} onClick={() => setCurStaff(null)}>
                All staff
              </Chip>
              {staffPerf.map((s) => (
                <Chip key={s.name} active={curStaff === s.name} onClick={() => setCurStaff(s.name)}>
                  {s.name}
                </Chip>
              ))}
            </div>
          </div>
          <p className="mb-2 mt-1.5 text-xs text-[#7c7280]">
            Actual time and clock-time for each stage, with the gap to SLA. Click any column header to sort.
          </p>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative w-full max-w-[320px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#a99fae]" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guest, phone, room, service…"
                className="w-full rounded-lg border border-[#ded5e2] bg-white py-2 pl-8 pr-3 text-[13px] outline-none focus:border-[#bd6791]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#7c7280]">
              <span>{totalRows === 0 ? '0 rows' : `${rangeStart}–${rangeEnd} of ${totalRows}`}</span>
              <label htmlFor="gej-size">Rows</label>
              <select
                id="gej-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-[#ded5e2] bg-white px-2 py-1.5 text-[13px] outline-none focus:border-[#bd6791]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
                <option value={0}>All</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-14 text-center text-sm text-[#7c7280]">Loading guest experience data…</div>
          ) : !previewRows.length ? (
            <div className="py-14 text-center text-sm font-semibold text-[#7c7280]">No guest experience data for the selected range.</div>
          ) : totalRows === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-center text-sm text-[#7c7280]">
              <p className="font-semibold">No rows match your filters.</p>
              <Chip
                active={false}
                onClick={() => {
                  setSearchTerm('');
                  setCurStaff(null);
                }}
              >
                Clear filters
              </Chip>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-[1500px] border-collapse text-xs">
                <thead>
                  <tr>
                    <Th label="Guest" k="guest" sortKey={sortKey} onSort={toggleSort} />
                    <Th label="Room" k="room" sortKey={sortKey} onSort={toggleSort} />
                    <Th label="Service" k="svc" sortKey={sortKey} onSort={toggleSort} />
                    <Th label="Accepted by" k="staff" sortKey={sortKey} onSort={toggleSort} />
                    <Th label="Time to accept" k="acc" sortKey={sortKey} onSort={toggleSort} num />
                    <Th label="Accept vs SLA" k="accd" sortKey={sortKey} onSort={toggleSort} num />
                    <Th label="Delivered by" k="delby" sortKey={sortKey} onSort={toggleSort} />
                    <Th label="Time to deliver" k="del" sortKey={sortKey} onSort={toggleSort} num />
                    <Th label="Deliver vs SLA" k="deld" sortKey={sortKey} onSort={toggleSort} num />
                    <Th label="Overall" k="verd" sortKey={sortKey} onSort={toggleSort} num />
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => {
                    const perf = row._perf;
                    return (
                      <tr key={`${row['Guest Phone']}-${row['Requested At']}-${(safePage - 1) * effPageSize + index}`} className="hover:bg-[#faf7fc]">
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 align-top">
                          <div className="font-semibold">{row['Guest Name']}</div>
                          <div className="text-[11px] text-[#7c7280]">{row['Guest Phone'] || 'No number'}</div>
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 align-top">
                          <span className="inline-flex items-center rounded-md bg-[#f9e9f1] px-2 py-0.5 text-[11px] font-semibold text-[#9c2f61]">
                            {row['Room No'] || '—'}
                          </span>
                        </td>
                        <td className="max-w-[190px] border-b border-[#ece6ee] px-2.5 py-2.5 align-top">
                          <div className="font-medium">{row['Service Requested'] || '-'}</div>
                          {row['Order Items'] ? (
                            <div className="truncate text-[11px] text-[#a99fae]" title={row['Order Items']}>
                              {row['Order Items']}
                            </div>
                          ) : null}
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 align-top">
                          {row['Accepted By Staff'] || '—'}
                          {row.Escalated === 'Yes' ? (
                            <span className="ml-1.5 rounded-full border border-[#eecbc4] bg-[#f8e6e2] px-1.5 py-0.5 text-[10px] font-semibold text-[#b23a2e]">
                              escalated{row['Escalation Level'] !== '' ? ` · L${row['Escalation Level']}` : ''}
                            </span>
                          ) : null}
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 text-right align-top">
                          <div className="font-semibold tabular-nums">{perf.accMin == null ? '—' : fmtMins(perf.accMin)}</div>
                          <div className="text-[11px] text-[#a99fae]">SLA {perf.accSla ? fmtMins(perf.accSla) : '—'}</div>
                          {row['Accepted At'] ? <div className="text-[11px] text-[#a99fae]">{row['Accepted At']}</div> : null}
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 text-right align-top">
                          <SlaPill delta={perf.accDelta} />
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 align-top">{row['Delivered By Staff'] || '—'}</td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 text-right align-top">
                          <div className="font-semibold tabular-nums">{perf.delMin == null ? '—' : fmtMins(perf.delMin)}</div>
                          <div className="text-[11px] text-[#a99fae]">SLA {perf.delSla ? fmtMins(perf.delSla) : '—'}</div>
                          {row['Delivered At'] ? <div className="text-[11px] text-[#a99fae]">{row['Delivered At']}</div> : null}
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 text-right align-top">
                          <SlaPill delta={perf.delDelta} />
                        </td>
                        <td className="border-b border-[#ece6ee] px-2.5 py-2.5 text-right align-top">
                          <VerdictPill perf={perf} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[11px] text-[#a99fae]">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Chip active={false} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                  ← Prev
                </Chip>
                <Chip active={false} disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
                  Next →
                </Chip>
              </div>
            </div>
          ) : null}

          <p className="mt-3 text-center text-[11px] text-[#a99fae]">
            A request is "on time" when total actual (accept + deliver) is within total SLA. Early shown green, late shown red — the same figure
            exports to the CSV.
          </p>
        </div>
      </section>
    </div>
  );
};

// ── presentational helpers ──────────────────────────────────────────────────
const fmtMins = (n: number) => {
  const v = Math.abs(n);
  if (v >= 60) {
    const h = Math.floor(v / 60);
    const m = Math.round(v % 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${Math.round(v * 10) / 10}m`;
};

const fmtNum = (n: number) => Math.round(n * 10) / 10;

const onTimeColor = (rate: number | null) => (rate == null ? '#241d24' : rate >= 85 ? '#3d7a17' : rate >= 60 ? '#9a6207' : '#b23a2e');

const Kpi = ({ label, dur, sub }: { label: string; dur: number | null; sub: string }) => {
  const hours = dur != null && dur >= 60;
  const value = dur == null ? '—' : hours ? Math.round((dur / 60) * 10) / 10 : Math.round(dur * 10) / 10;
  return (
    <div className={`${CARD} p-[15px]`}>
      <div className="text-[11px] text-[#7c7280]">{label}</div>
      <div className="font-fraunces mt-1 text-[23px] font-semibold leading-tight">
        {value}
        {dur == null ? null : <small className="text-[13px] text-[#a99fae]"> {hours ? 'hr' : 'min'}</small>}
      </div>
      <div className="mt-[3px] text-[11px] text-[#a99fae]">{sub}</div>
    </div>
  );
};

const MiniRow = ({ label, value, color, last }: { label: string; value: number; color?: string; last?: boolean }) => (
  <div className={`flex items-center justify-between py-1.5 text-xs ${last ? '' : 'border-b border-[#ece6ee]'}`}>
    <span>{label}</span>
    <b style={color ? { color } : undefined}>{value}</b>
  </div>
);

const SlaPill = ({ delta }: { delta: number | null }) => {
  if (delta == null) return <span className="text-[11px] text-[#a99fae]">—</span>;
  const early = delta >= 0;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${early ? 'border-[#cfe3b5] bg-[#eaf4dc] text-[#3d7a17]' : 'border-[#eecbc4] bg-[#f8e6e2] text-[#b23a2e]'}`}
    >
      {fmtMins(delta)} {early ? 'early' : 'late'}
    </span>
  );
};

const VerdictPill = ({ perf }: { perf: ServicePerf }) => {
  if (perf.onTime == null) return <span className="text-[11px] text-[#a99fae]">in progress</span>;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tabular-nums ${perf.onTime ? 'border-[#cfe3b5] bg-[#eaf4dc] text-[#3d7a17]' : 'border-[#eecbc4] bg-[#f8e6e2] text-[#b23a2e]'}`}
    >
      {perf.onTime ? `${fmtMins(perf.verdict ?? 0)} before SLA` : `over by ${fmtMins(perf.verdict ?? 0)}`}
    </span>
  );
};

const Chip = ({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${active ? 'border-[#9c2f61] bg-[#9c2f61] text-white' : 'border-[#ded5e2] bg-white text-[#7c7280] hover:border-[#bd6791] hover:text-[#241d24]'} ${disabled ? 'pointer-events-none opacity-40' : ''}`}
  >
    {children}
  </button>
);

const Th = ({ label, k, sortKey, onSort, num }: { label: string; k: SortKey; sortKey: SortKey; onSort: (k: SortKey) => void; num?: boolean }) => (
  <th
    onClick={() => onSort(k)}
    className={`sticky top-0 z-[1] cursor-pointer select-none whitespace-nowrap border-b border-[#ded5e2] bg-[#faf7fc] px-2.5 py-2.5 font-medium ${num ? 'text-right' : 'text-left'} ${sortKey === k ? 'text-[#9c2f61]' : 'text-[#7c7280]'}`}
  >
    {label}
    <span className={`ml-0.5 text-[9px] ${sortKey === k ? 'opacity-100' : 'opacity-40'}`}>▾</span>
  </th>
);

export default GuestServiceJourney;
