import { apiRpc } from "@hi/common";
import { useSalesStore, type Filters } from "@/components/store/useSalesStore";
import type { HistoryData } from "@/components/types/businessData";
import { businessCardTypes } from "@/hooks/useGetAllCards.ts";

export type OutletType =
  (typeof businessCardTypes)[keyof typeof businessCardTypes];

const toStr = (v: string | number | Date) =>
  typeof v === "string" ? v : String(v);
const isJewellery = (t?: string | null) =>
  t?.toLowerCase?.() === businessCardTypes.JEWELLERY;

export type BillsFetchParams = {
  businessId: string;
  from: string | number | Date;
  to: string | number | Date;
  pageNumber?: string | number; // generic supports this
  appliedFilter?: Filters | unknown[]; // generic supports this
  download?: string; // e.g., "csv"
  outletType?: OutletType | string | null; // to switch endpoints
};

export async function fetchBillsGeneric({
  businessId,
  from,
  to,
  pageNumber,
  appliedFilter,
  download,
}: BillsFetchParams): Promise<HistoryData> {
  const { setHistoryData, setTotalSales } = useSalesStore();

  const res = await apiRpc.payments[":id"].bills.$get({
    param: { id: businessId },
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      pageNumber: pageNumber?.toString() ?? "1",
      appliedFilter: JSON.stringify(appliedFilter ?? []),
      ...(download ? { download } : {}),
    },
  });
  const json = await res.json();
  if (res.status !== 200) throw new Error("Failed to fetch bills");
  if (res.status === 200) {
    setHistoryData(json.data.existingPayments);
    setTotalSales(json.data.totalSale);
  }
  return json.data as HistoryData;
}

export async function fetchBillsJewellery({
  businessId,
  from,
  to,
  download,
}: BillsFetchParams): Promise<HistoryData> {
  const { setHistoryData, setTotalSales, selectedFilters } = useSalesStore();
  const res = await apiRpc.jewellery.payments.bills.$get({
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      appliedFilter: JSON.stringify(selectedFilters ?? []),
      ...(download ? { download } : {}),
    },
  });
  const json = await res.json();
  if (res.status !== 200) throw new Error("Failed to fetch jewellery bills");
  if (res.status === 200) {
    setHistoryData(json.data.existingPayments);
    setTotalSales(json.data.totalSale);
  }
  return json.data as HistoryData;
}

export async function fetchBillsByType(
  params: BillsFetchParams,
): Promise<HistoryData> {
  return isJewellery(params.outletType)
    ? fetchBillsJewellery(params)
    : fetchBillsGeneric(params);
}

// csv payment apis
export type BillsCsvParams = {
  businessId: string;
  from: string | number | Date;
  to: string | number | Date;
  appliedFilter?: Filters | unknown[];
  outletType: string | null;
};

export async function fetchBillsCsvGeneric({
  businessId,
  from,
  to,
  appliedFilter,
}: BillsCsvParams): Promise<Blob> {
  const res = await apiRpc.payments[":id"].bills_csv.$get({
    param: { id: businessId },
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      appliedFilter: JSON.stringify(appliedFilter ?? []),
    },
  });
  if (res.status !== 200) throw new Error("Failed to fetch CSV");
  return res.blob();
}

export async function fetchBillsCsvJewellery({
  businessId,
  from,
  to,
  appliedFilter,
}: BillsCsvParams): Promise<Blob> {
  const res = await apiRpc.jewellery.payments.bills.csv.$get({
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      appliedFilter: JSON.stringify(appliedFilter ?? []),
    },
  });
  if (res.status !== 200) throw new Error("Failed to fetch jewellery CSV");
  return res.blob();
}

export async function fetchBillsCsvByType(
  params: BillsCsvParams,
): Promise<Blob> {
  return isJewellery(params.outletType)
    ? fetchBillsCsvJewellery(params)
    : fetchBillsCsvGeneric(params);
}
