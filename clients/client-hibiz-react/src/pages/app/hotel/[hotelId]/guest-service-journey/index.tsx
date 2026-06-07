import MemoizedHeader from '@/components/molecules/header';
import DateRangePicker from '@/components/molecules/dateRangePicker';
import useBusinessData from '@/components/store/useBusinessData';
import useTimings from '@/components/store/useTimings';
import { useHistoryAlerts } from '@/components/store/hotel/useHotelApis';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchReviews, type reviewResponse } from '@/hooks/hotel/useReviewHook';
import { fetchIndividualUserAnalytics, useUsersAnalyticsData } from '@/hooks/hotel/useUserData';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock3, Download, Hotel, Search, Star, TriangleAlert, Users, Wrench } from 'lucide-react';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MAX_REPORT_MONTHS = 3;

type StaffRef = { _id?: string; name?: string; phone?: string } | null | undefined;
type ServiceRef = { _id?: string; name?: string };
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

const formatFilenameDate = (timestamp?: number) => {
  if (!timestamp) return 'unknown-date';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
};

const isWithinMonthLimit = (from?: number, to?: number, months = MAX_REPORT_MONTHS) => {
  if (!from || !to || to < from) return false;
  const maxDate = new Date(from);
  maxDate.setMonth(maxDate.getMonth() + months);
  return to <= maxDate.getTime();
};

const getMinutes = (from?: number, to?: number) => {
  if (!from || !to || to < from) return '';
  return Number(((to - from) / 60000).toFixed(2));
};

const getDurationLabel = (from?: number, to?: number) => {
  if (!from || !to || to < from) return '';
  const totalMinutes = Math.round((to - from) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours ? `${hours}h` : '', minutes || !hours ? `${minutes}m` : ''].filter(Boolean).join(' ');
};

const escapeCsvValue = (value: unknown) => {
  const str = String(value ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const downloadCsv = (filename: string, summaryLines: string[], rows: JourneyRow[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]) as Array<keyof JourneyRow>;
  const table = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n');
  const blob = new Blob(['\uFEFF' + `${summaryLines.join('\n')}\n\n${table}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const joinNames = (items?: ServiceRef[]) => items?.map((item) => item?.name).filter(Boolean).join(', ') || '';

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

const buildJourneyRows = (
  alerts: AlertItem[],
  reviews: reviewResponse[],
  visitCountByPhone: Map<string, number>,
  stayByPhone: Map<string, { source?: string; checkIn?: number; checkOut?: number }>,
) =>
  alerts.map((alert) => {
    const phone = alert.createdBy?.phone || '';
    const review = findMatchingReview(alert, reviews);
    const stay = phone ? stayByPhone.get(phone) : undefined;

    return {
      'Guest Name': alert.createdBy?.name || 'Guest',
      'Guest Phone': phone,
      'Room No': alert.roomId?.name || '',
      'Visit Count Till Date': phone ? visitCountByPhone.get(phone) ?? '' : '',
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
      'Escalation Level': alert.isEscalated ? alert.level ?? 0 : '',
      'Crossed Escalation SLA': alert.isEscalated ? 'Yes' : 'No',
      'Service Rating': review?.reviewRating ?? '',
      'Review Feedback': review?.note || review?.improvementAreas?.filter(Boolean).join(', ') || '',
      'Reviewed At': formatDateTime(review?.date),
    } satisfies JourneyRow;
  });

const fetchVisitCounts = async (businessId: string, alerts: AlertItem[]) => {
  const usersById = new Map<string, { phone: string }>();
  for (const alert of alerts) {
    const userId = alert.createdBy?._id;
    const phone = alert.createdBy?.phone;
    if (userId && phone) usersById.set(userId, { phone });
  }

  const visitCountByPhone = new Map<string, number>();
  const userEntries = Array.from(usersById.entries());
  const concurrency = 5;

  for (let index = 0; index < userEntries.length; index += concurrency) {
    const batch = userEntries.slice(index, index + concurrency);
    const results = await Promise.allSettled(
      batch.map(([userId]) => fetchIndividualUserAnalytics({ businessId, userId })),
    );

    results.forEach((result, resultIndex) => {
      const phone = batch[resultIndex][1].phone;
      if (result.status === 'fulfilled') {
        visitCountByPhone.set(phone, result.value.userAnalytics.length);
      }
    });
  }

  return visitCountByPhone;
};

const GuestServiceJourney = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) ?? '';
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const [isDownloading, setIsDownloading] = useState(false);

  const { historyData = [], isPending: isHistoryPending } = useHistoryAlerts();
  const { userAnalyticsData, isFetching: isUsersFetching } = useUsersAnalyticsData({
    businessId,
    from: String(timeStampStart),
    to: String(timeStampEnd),
  });

  const {
    data: reviews = [],
    isFetching: isReviewsFetching,
  } = useQuery({
    queryKey: ['guestServiceJourneyReviews', businessId, timeStampStart, timeStampEnd],
    queryFn: () =>
      fetchReviews({
        businessId,
        from: timeStampStart,
        to: timeStampEnd,
      }) as unknown as Promise<reviewResponse[]>,
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
        map.set(phone, {
          source: stay.source,
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
        });
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

  const stats = useMemo(() => {
    const uniqueGuests = new Set(alerts.map((alert) => alert.createdBy?.phone).filter(Boolean)).size;
    const escalated = alerts.filter((alert) => alert.isEscalated).length;
    const rated = previewRows.filter((row) => row['Service Rating'] !== '').length;
    const avgResolutionMinutes = alerts
      .map((alert) => getMinutes(alert.createdAt, alert.deliveredAt))
      .filter((value): value is number => typeof value === 'number');

    return {
      requests: alerts.length,
      uniqueGuests,
      escalated,
      rated,
      avgResolution: avgResolutionMinutes.length
        ? `${Number((avgResolutionMinutes.reduce((sum, value) => sum + value, 0) / avgResolutionMinutes.length).toFixed(1))} min`
        : '-',
    };
  }, [alerts, previewRows]);

  const isLoading = isHistoryPending || isReviewsFetching || isUsersFetching;
  const canDownload = isWithinMonthLimit(timeStampStart, timeStampEnd);

  const handleDownload = useCallback(async () => {
    if (!alerts.length) {
      toast.error('No guest experience report data available to download.');
      return;
    }

    if (!canDownload) {
      toast.error(`Cannot download more than ${MAX_REPORT_MONTHS} months of guest experience report data at a time.`);
      return;
    }

    try {
      setIsDownloading(true);
      const visitCountByPhone = await fetchVisitCounts(businessId, alerts);
      const rows = buildJourneyRows(alerts, reviews, visitCountByPhone, stayByPhone);
      const summaryLines = [
        'HOTEL GUEST EXPERIENCE REPORT',
        `Total Service Requests: ${rows.length}`,
        `Unique Guests: ${stats.uniqueGuests}`,
        `Escalated Requests: ${stats.escalated}`,
        `Rated Requests: ${stats.rated}`,
        `Date Range: ${formatDateTime(timeStampStart)} to ${formatDateTime(timeStampEnd)}`,
        `Generated At: ${formatDateTime(Date.now())}`,
        '--------------------------------------------',
      ];

      downloadCsv(
        `guest_experience_report_${formatFilenameDate(timeStampStart)}-to-${formatFilenameDate(timeStampEnd)}.csv`,
        summaryLines,
        rows,
      );
      toast.success('Guest experience report downloaded.');
    } catch (error) {
      console.error('Failed to download guest experience report:', error);
      toast.error('Failed to download guest experience report.');
    } finally {
      setIsDownloading(false);
    }
  }, [alerts, businessId, canDownload, reviews, stats.escalated, stats.rated, stats.uniqueGuests, stayByPhone, timeStampEnd, timeStampStart]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Guest Experience Report" leftIcon={<ArrowLeft />} onBack={() => navigate(-1)} />
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <DateRangePicker />
            <Button
              onClick={handleDownload}
              disabled={isDownloading || isLoading || !alerts.length}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-600"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Preparing Report...' : 'Download Report'}
            </Button>
          </div>
          <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${canDownload ? 'border-blue-100 bg-blue-50 text-blue-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            Guest Experience Report maps guest, room, stay date, service request, accepted and delivered staff, escalation, rating, feedback, and visit count. Downloads support up to {MAX_REPORT_MONTHS} months at a time.
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricCard icon={<Wrench className="h-5 w-5" />} label="Service Requests" value={stats.requests} />
          <MetricCard icon={<Users className="h-5 w-5" />} label="Guests" value={stats.uniqueGuests} />
          <MetricCard icon={<Clock3 className="h-5 w-5" />} label="Avg Resolution" value={stats.avgResolution} />
          <MetricCard icon={<Star className="h-5 w-5" />} label="Rated Requests" value={stats.rated} />
          <MetricCard icon={<TriangleAlert className="h-5 w-5" />} label="Escalated" value={stats.escalated} />
        </div>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Experience Preview</h1>
                <p className="mt-1 text-sm text-slate-500">Preview maps the selected range. Download enriches lifetime visit counts and exports the full guest experience dataset.</p>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Search className="h-4 w-4" />
                Showing {previewRows.length} rows
              </div>
            </div>

            {isLoading ? (
                <div className="p-6 text-sm text-slate-500">Loading guest experience data...</div>
            ) : !previewRows.length ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center text-slate-500">
                <Hotel className="h-10 w-10" />
                <p className="font-medium">No guest experience data found for the selected range.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1350px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Guest</th>
                      <th className="px-4 py-3">Stay Context</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Requested</th>
                      <th className="px-4 py-3">Accepted</th>
                      <th className="px-4 py-3">Delivered</th>
                      <th className="px-4 py-3">Resolution</th>
                      <th className="px-4 py-3">Escalated</th>
                      <th className="px-4 py-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewRows.slice(0, 25).map((row, index) => (
                      <tr key={`${row['Guest Phone']}-${row['Requested At']}-${index}`} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{row['Guest Name']}</div>
                          <div className="text-xs text-slate-500">{row['Guest Phone']}</div>
                          <div className="mt-1 text-xs text-slate-500">Visits: {row['Visit Count Till Date'] || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">Room {row['Room No'] || '-'}</div>
                          <div className="text-xs text-slate-500">Source: {row['Booking Source'] || '-'}</div>
                          <div className="mt-1 text-xs text-slate-500">In: {row['Check-In Date Time'] || '-'}</div>
                          <div className="text-xs text-slate-500">Out: {row['Check-Out Date Time'] || '-'}</div>
                        </td>
                        <td className="max-w-[220px] px-4 py-3">
                          <div className="truncate font-medium">{row['Service Requested'] || '-'}</div>
                          <div className="truncate text-xs text-slate-500">{row['Order Items']}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">{row['Requested At'] || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{row['Accepted By Staff'] || '-'}</div>
                          <div className="text-xs text-slate-500">{row['Accepted At']}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{row['Delivered By Staff'] || '-'}</div>
                          <div className="text-xs text-slate-500">{row['Delivered At']}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>Accept: {row['Acceptance Time'] || '-'}</div>
                          <div>Deliver: {row['Delivery Time'] || '-'}</div>
                          <div className="font-semibold text-slate-700">Total: {row['Total Resolution Time'] || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.Escalated === 'Yes' ? 'bg-rose-50 text-rose-700' : 'bg-teal-50 text-teal-700'}`}>
                            {row.Escalated}
                          </span>
                          {row['Escalation Level'] !== '' ? <div className="mt-1 text-xs text-slate-500">Level {row['Escalation Level']}</div> : null}
                        </td>
                        <td className="max-w-[180px] px-4 py-3">
                          <div className="font-semibold">{row['Service Rating'] || '-'}</div>
                          <div className="truncate text-xs text-slate-500">{row['Review Feedback'] || 'No feedback'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export default GuestServiceJourney;
