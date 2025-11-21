import { type Filters, useSalesStore } from "@/components/store/useSalesStore";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import { useApiErrorHandler } from "./useApiErrorHandler";

export interface salesPayload {
  businessId: string;
  pageNumber?: string;
  from: string;
  to: string;
  appliedFilters?: Filters;
  download?: string;
}

export const useGetallSalesByGet = (payload: salesPayload) => {
  const setHistoryData = useSalesStore((s) => s.setHistoryData);
  const setTotalSales = useSalesStore((s) => s.setTotalSales);
  const selectedFilters = useSalesStore((s) => s.selectedFilters);
  const { handleEnvelope } = useApiErrorHandler();

  if (!payload.businessId) return;

  const allSalesData = async (payload: salesPayload) => {
    const response = await apiRpc.payments[":id"].bills.$get({
      query: {
        ...payload,
        appliedFilter: JSON.stringify(selectedFilters),
      },
      param: {
        id: payload.businessId,
      },
    });
    const data = await handleEnvelope(response);
    if (response.status === 200) {
      setHistoryData(data.existingPayments);
      setTotalSales(data.totalSale);
    }
    return data;
  };

  const { isLoading, refetch } = useQuery({
    queryKey: [
      "allSalesDataByGet",
      payload.businessId,
      payload.from,
      payload.to,
      payload.pageNumber,
      payload.appliedFilters,
      JSON.stringify(selectedFilters),
    ],
    queryFn: () => allSalesData(payload),
    enabled:
      !!payload.businessId &&
      !!payload.from &&
      !!payload.to &&
      !!payload.pageNumber,
    staleTime: 30_000,
  });

  return { isLoading, refetch };
};
