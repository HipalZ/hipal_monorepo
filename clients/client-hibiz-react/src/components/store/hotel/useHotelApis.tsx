import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import useTimings from '@/components/store/useTimings';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';

export type HistoryCategoryFilter = 'all' | 'food' | 'housekeeping' | 'frontOffice' | 'maintenance';
export type HistoryStatusFilter = 'all' | 'DELIVERED' | 'NOT_DELIVERED' | 'REJECTED' | 'RESOLVED';

export type HistoryAlertPageFilters = {
  page?: number;
  limit?: number;
  search?: string;
  category?: HistoryCategoryFilter;
  room?: string;
  service?: string;
  status?: HistoryStatusFilter;
  staff?: string;
};

type HistoryAlertPage = {
  rows: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: Record<'food' | 'housekeeping' | 'frontOffice' | 'maintenance', number>;
  roomSummary: { name: string; count: number }[];
  filterOptions: {
    rooms: string[];
    services: string[];
    staff: string[];
  };
};

const emptyHistoryPage = (filters: HistoryAlertPageFilters): HistoryAlertPage => ({
  rows: [],
  total: 0,
  page: filters.page ?? 1,
  limit: filters.limit ?? 20,
  totalPages: 1,
  summary: { food: 0, housekeeping: 0, frontOffice: 0, maintenance: 0 },
  roomSummary: [],
  filterOptions: { rooms: [], services: [], staff: [] },
});

export const useHistoryAlerts = (filters?: HistoryAlertPageFilters) => {
  const timeStampStart = useTimings((s) => s.timeStampStart);
  const timeStampEnd = useTimings((s) => s.timeStampEnd);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const userId = useOwnerLogin((s) => s.user?._id);
  const shouldUsePagedHistory = Boolean(filters && Object.keys(filters).length > 0);

  const historyAlerts = async (): Promise<any[] | HistoryAlertPage> => {
    if (shouldUsePagedHistory) {
      const response = await (apiRpc.hotel.alert as any).fetch_alert_history_page.$get({
        query: {
          businessId,
          from: timeStampStart.toString(),
          to: timeStampEnd.toString(),
          userId,
          page: String(filters?.page ?? 1),
          limit: String(filters?.limit ?? 20),
          ...(filters?.search ? { search: filters.search } : {}),
          ...(filters?.category && filters.category !== 'all' ? { category: filters.category } : {}),
          ...(filters?.room && filters.room !== 'all' ? { room: filters.room } : {}),
          ...(filters?.service && filters.service !== 'all' ? { service: filters.service } : {}),
          ...(filters?.status && filters.status !== 'all' ? { status: filters.status } : {}),
          ...(filters?.staff && filters.staff !== 'all' ? { staff: filters.staff } : {}),
        },
      });
      const res = await response.json();
      if (response.status === 200 || response.status === 201) {
        return res.data as HistoryAlertPage;
      }
      return emptyHistoryPage(filters ?? {});
    }

    const response = await apiRpc.hotel.alert.fetch_alert_history.$get({
      query: {
        businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
        userId,
      },
    });
    const res = await response.json();
    if (response.status === 200 || response.status === 201) {
      return res.data as any[];
    }
    return [];
  };
  const { data, isPending } = useQuery({
    queryKey: ['historyAlerts', businessId, userId, timeStampStart, timeStampEnd, shouldUsePagedHistory, filters ?? null],
    queryFn: historyAlerts,
    enabled: !!businessId && !!userId && !!timeStampStart && !!timeStampEnd,
    placeholderData: (previousData) => previousData,
  });

  if (shouldUsePagedHistory) {
    const pageData = (data as HistoryAlertPage | undefined) ?? emptyHistoryPage(filters ?? {});
    return {
      historyData: pageData.rows,
      historyTotal: pageData.total,
      historyPage: pageData.page,
      historyLimit: pageData.limit,
      historyTotalPages: pageData.totalPages,
      historySummary: pageData.summary,
      historyRoomSummary: pageData.roomSummary ?? [],
      historyFilterOptions: pageData.filterOptions,
      isPending,
    };
  }

  return {
    historyData: Array.isArray(data) ? data : [],
    historyTotal: Array.isArray(data) ? data.length : 0,
    historyPage: 1,
    historyLimit: Array.isArray(data) ? data.length : 0,
    historyTotalPages: 1,
    historySummary: { food: 0, housekeeping: 0, frontOffice: 0, maintenance: 0 },
    historyRoomSummary: [],
    historyFilterOptions: { rooms: [], services: [], staff: [] },
    isPending,
  };
};
