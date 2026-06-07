import ReviewAccordionCard from '@/components/hotel/review/ReviewCard.tsx';
import ReviewsFilters from '@/components/hotel/review/ReviewFilters.tsx';
import MemoizedHeader from '@/components/molecules/header/index.tsx';
import type { IService } from '@/components/store/hotel/useHotelServices.ts';
import { useReviewsFilterStore } from '@/components/store/hotel/useReview.ts';
import useBusinessData from '@/components/store/useBusinessData';
import type { ReviewItem } from '@/components/types/hotelTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchReviews } from '@/hooks/hotel/useReviewHook.ts';
import { type IHotelStaff, useGetAllHotelServices, useGetAllHotelStaff } from '@/hooks/useHotelStaff.ts';
import { useQuery } from '@tanstack/react-query';
import { Download, Filter, MessageSquareText, Star, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const formatExcelTimestamp = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const escapeCsvValue = (value: unknown) => {
  const str = String(value ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const downloadCsv = (filename: string, summaryLines: string[], rows: Record<string, unknown>[]) => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const summarySection = summaryLines.join('\n');
  const tableSection = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(',')),
  ].join('\n');

  const csvContent = `${summarySection}\n\n${tableSection}`;

  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const StatsCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="truncate text-xl font-semibold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HotelReviews() {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId) as string | undefined;

  const { hotelServicesData = [] as IService[] } = useGetAllHotelServices(businessId || '') || {};

  const { staffData = [] as IHotelStaff[] } = useGetAllHotelStaff(businessId || '') || {};

  const createPayload = useReviewsFilterStore((s) => s.createPayload);
  const isFiltered = useReviewsFilterStore((s) => s.isFiltered);
  const applyKey = useReviewsFilterStore((s) => s.applyKey);

  const [isDownloading, setIsDownloading] = useState(false);

  const payload = useMemo(() => (businessId ? createPayload(businessId) : null), [businessId, applyKey, createPayload]);

  const payloadKey = useMemo(() => {
    if (!payload) return 'nopayload';

    const { from, to, filter } = payload;

    return JSON.stringify({
      from,
      to,
      filter: {
        ...filter,
        serviceIds: filter?.serviceIds ? [...filter.serviceIds].sort() : undefined,
        staffIds: filter?.staffIds ? [...filter.staffIds].sort() : undefined,
        roomIds: filter?.roomIds ? [...filter.roomIds].sort() : undefined,
        rating: filter?.rating,
        isRead: filter?.isRead,
      },
    });
  }, [payload]);

  const {
    data: results = [],
    isFetching,
    isLoading,
    refetch,
  } = useQuery<ReviewItem[]>({
    queryKey: ['reviews', businessId, payloadKey],
    queryFn: () => fetchReviews(payload!),
    enabled: !!businessId && !!payload,
  });

  useEffect(() => {
    useReviewsFilterStore.getState().setBusinessId(businessId);
  }, [businessId]);

  const onApply = useCallback(() => {
    useReviewsFilterStore.getState().apply();
  }, []);

  const filtered = isFiltered();

  const analytics = useMemo(() => {
    const totalReviews = results.length;

    const uniqueGuests = new Set(results.map((r) => (typeof r.userId === 'object' && r.userId !== null ? r.userId.name : '')).filter(Boolean)).size;

    const allServices = results.flatMap((r) => r.alertId?.serviceIds?.map((s) => s?.name).filter(Boolean) || []);

    const uniqueServices = new Set(allServices).size;

    const ratings = results.map((r) => Number(r.reviewRating)).filter((r) => !Number.isNaN(r));

    const avgRating = ratings.length ? (ratings.reduce((sum, n) => sum + n, 0) / ratings.length).toFixed(1) : '0.0';

    return {
      totalReviews,
      uniqueGuests,
      uniqueServices,
      avgRating,
    };
  }, [results]);

  const handleDownloadReviewsReport = useCallback(async () => {
    try {
      setIsDownloading(true);

      if (!results.length) {
        alert('No reviews available to download.');
        return;
      }

      const curatedReviewRows = results.map((item) => {
        const user = typeof item?.userId === 'object' && item?.userId !== null ? item.userId : null;

        const reviewedServices =
          item?.alertId?.serviceIds
            ?.map((service) => service?.name)
            .filter(Boolean)
            .join(', ') || '';

        return {
          'Review Time': formatExcelTimestamp(item?.date),
          'Guest Name': user?.name || '',
          'Room No': item?.roomId?.name || '',
          'Reviewed Service': reviewedServices,
          Rating: item?.reviewRating ?? '',
          'Improvement Areas': item?.improvementAreas?.filter(Boolean).join(', ') || '',
          'Accepted By': item?.alertId?.acceptedBy?.name || '',
          'Completed By': item?.alertId?.deliveredBy?.name || '',
          Read: item?.isRead ? 'TRUE' : 'FALSE',
          'Read At': formatExcelTimestamp(item?.readAt),
          'Read By': item?.readBy?.name || '',
          'Guest Note': item?.note || '',
        };
      });

      const uniqueGuests = new Set(curatedReviewRows.map((row) => row['Guest Name']).filter(Boolean)).size;

      const uniqueReviewedServices = new Set(curatedReviewRows.map((row) => row['Reviewed Service']).filter(Boolean)).size;

      const ratingValues = results.map((r) => Number(r?.reviewRating)).filter((r) => !Number.isNaN(r));

      const averageRating = ratingValues.length ? (ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length).toFixed(2) : '0.00';

      const rawReviewTimestamps = results
        .map((item) => item?.date)
        .filter((ts): ts is number => Boolean(ts))
        .sort((a, b) => a - b);

      const minDate = rawReviewTimestamps.length ? formatExcelTimestamp(rawReviewTimestamps[0]) : '';

      const maxDate = rawReviewTimestamps.length ? formatExcelTimestamp(rawReviewTimestamps[rawReviewTimestamps.length - 1]) : '';

      const summaryLines = [
        'HOTEL REVIEW MANAGEMENT REPORT',
        `Total Reviews: ${curatedReviewRows.length}`,
        `Unique Reviewing Guests: ${uniqueGuests}`,
        `Unique Reviewed Services: ${uniqueReviewedServices}`,
        `Average Rating: ${averageRating}`,
        `Date Range: ${minDate} to ${maxDate}`,
        `Generated At: ${new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })}`,
        '--------------------------------------------',
      ];

      const filename = `hotel_review_report_${Date.now()}.csv`;
      downloadCsv(filename, summaryLines, curatedReviewRows);
    } catch (error) {
      console.error('Failed to download review report:', error);
      alert('Failed to download review report.');
    } finally {
      setIsDownloading(false);
    }
  }, [results]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Review Report" />
      </header>

      <section className="mx-auto max-w-7xl px-4 py-5 md:px-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Review Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">Track guest feedback, rating trends, and service performance in one place.</p>
          </div>

          <Button
            onClick={handleDownloadReviewsReport}
            disabled={isDownloading || isFetching || isLoading || !results.length}
            className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Preparing Report...' : 'Download Report'}
          </Button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard icon={<MessageSquareText className="h-5 w-5" />} label="Total Reviews" value={analytics.totalReviews} />
          <StatsCard icon={<Users className="h-5 w-5" />} label="Reviewing Guests" value={analytics.uniqueGuests} />
          <StatsCard icon={<Filter className="h-5 w-5" />} label="Reviewed Services" value={analytics.uniqueServices} />
          <StatsCard icon={<Star className="h-5 w-5" />} label="Average Rating" value={analytics.avgRating} />
        </div>

        <Card className="mb-6 rounded-2xl border border-slate-200 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Filters</h2>
              <p className="mt-1 text-sm text-slate-500">Narrow reviews by rating, read status, dates, services, and staff.</p>
            </div>

            <ReviewsFilters services={hotelServicesData} staff={staffData} onApply={onApply} busy={isFetching || isLoading} />
          </CardContent>
        </Card>

        {isFetching && results.length === 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="rounded-2xl border border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="mt-5 h-20 animate-pulse rounded-xl bg-slate-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isFetching && results.length === 0 && (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <MessageSquareText className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">No reviews found</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                {filtered
                  ? 'No reviews match the filters you selected. Try adjusting your date range, rating, service, or staff filters.'
                  : 'No reviews are available for the current selection yet.'}
              </p>
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <ReviewAccordionCard key={r._id} r={r} staffData={staffData} refetch={refetch} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
