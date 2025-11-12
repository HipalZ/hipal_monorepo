import { type Filters, useSalesStore } from '@/components/store/useSalesStore';
import type { HistoryData } from '@/components/types/businessData';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { useApiErrorHandler } from './useApiErrorHandler';

export interface salesPayload {
  businessId: string;
  pageNumber?: string;
  from: string;
  to: string;
  appliedFilters?: Filters;
  download?: string;
}

export const useGetallSalesByGet = (payload: salesPayload) => {
  const { setHistoryData, setTotalSales, selectedFilters } = useSalesStore();
  if (!payload.businessId) return;
  const { handleEnvelope } = useApiErrorHandler();
  const allSalesData = async (payload: salesPayload) => {
    const response = await apiRpc.payments[':id'].bills.$get({
      query: {
        ...payload,
        appliedFilter: JSON.stringify(selectedFilters),
      },
      param: {
        id: payload.businessId,
      },
    });
    const data = await handleEnvelope<HistoryData>(response);
    console.log('allSalesData data', data);
    if (response.status === 200) {
      setHistoryData(data.existingPayments);
      setTotalSales(data.totalSale);
    }
    return data;
  };

  const { isLoading } = useQuery({
    queryKey: [
      'allSalesDataByGet',
      payload.businessId,
      payload.from,
      payload.to,
      payload.pageNumber,
      payload.appliedFilters,
      JSON.stringify(selectedFilters),
    ],
    queryFn: () => allSalesData(payload),
    enabled: !!payload.businessId && !!payload.from && !!payload.to && !!payload.pageNumber,
  });

  return { isLoading };
};
