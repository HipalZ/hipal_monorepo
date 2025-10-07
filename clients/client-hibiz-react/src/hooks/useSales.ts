import { fetchBills } from "@/api/salesQueries.ts";
import type { Filters } from "@/components/store/useSalesStore";
import { useQuery } from "@tanstack/react-query";

export interface salesPayload {
  businessId: string;
  pageNumber?: string;
  from: string;
  to: string;
  appliedFilters?: Filters;
  download?: string;
  outletType: string;
}

export const useGetallSalesByGet = (payload: salesPayload) => {
  if (!payload.businessId) return;
  const { isLoading, data } = useQuery({
    queryKey: [
      "allSalesDataByGet",
      payload.businessId,
      payload.from,
      payload.to,
      payload.pageNumber,
      payload.appliedFilters,
    ],
    queryFn: () => fetchBills(payload),
    enabled: !!payload.businessId && !!payload.from && !!payload.to,
  });

  return { isLoading,data };
};
