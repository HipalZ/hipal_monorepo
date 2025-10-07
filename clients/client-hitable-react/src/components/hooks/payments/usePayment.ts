// src/hooks/useSalesDashboard.ts
import { useQuery } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import {
  fetchSalesSummary,
  fetchOtherAndWarnings,
  fetchExceptionAndRewards,
  type SalesData,
  type OtherAndWarningData,
  type SalesExceptionData,
  type TableData,
} from "@/api/salesQueries";
import { apiRpc } from "@hi/common";

export const useSalesData = (from?: number | string, to?: number | string) => {
  const outletType = useBusinessData((s) => s?.outletInfo?.outLetType);
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);

  return useQuery<SalesData, Error>({
    queryKey: ["salesData", outletType, businessId, from, to],
    enabled: !!businessId && !!from && !!to,
    queryFn: () =>
      fetchSalesSummary({
        businessId: businessId,
        from: from!,
        to: to!,
        outletType,
      }),
  });
};

export const useOtherAndWarning = (
  from?: number | string,
  to?: number | string,
) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const outletType = useBusinessData((s) => s?.outletInfo?.outLetType);

  return useQuery<OtherAndWarningData, Error>({
    queryKey: ["otherAndWarning", outletType, businessId, from, to],
    enabled: !!businessId && !!from && !!to,
    queryFn: () =>
      fetchOtherAndWarnings({
        businessId: businessId,
        from: from!,
        to: to!,
        outletType,
      }),
  });
};

export const useSalesException = (
  from?: number | string,
  to?: number | string,
) => {
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const outletType = useBusinessData((s) => s?.outletInfo?.outLetType);

  return useQuery<SalesExceptionData, Error>({
    queryKey: ["salesException", outletType, businessId, from, to],
    enabled: !!businessId && !!from && !!to,
    queryFn: () =>
      fetchExceptionAndRewards({
        businessId: businessId,
        from: from!,
        to: to!,
        outletType,
      }),
  });
};

export const useTables = (businessId?: string | null) =>
  useQuery<TableData[], Error>({
    queryKey: ["tables", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const response = await apiRpc.table.all[":businessId"].$get({
        param: { businessId: businessId! },
      });
      const json = await response.json();
      return (json.data || []) as TableData[];
    },
  });
