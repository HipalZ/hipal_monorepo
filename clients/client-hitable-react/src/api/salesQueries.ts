import { businessCardTypes } from "@/components/utils/helpers.ts";
import { apiRpc } from "@hi/common";

export interface TableData {
  active: string;
  businessId: string;
  createdAt: string;
  currentTableAmount: number;
  capacity?: number;
  displayForCaptains: boolean;
  isDeleted: boolean;
  name: string;
  rank: string;
  staffIds: string[];
  isTransfer?: boolean;
  status: string;
  tableId: string;
  updatedAt: string;
  tableItemCount: number;
  userIds: string[];
  zoneId: string;
  hiCode?: string;
  _id: string;
}

export type OutletType =
  (typeof businessCardTypes)[keyof typeof businessCardTypes];

export interface Range {
  businessId: string;
  from: string | number | Date;
  to: string | number | Date;
}

export interface SalesData {
  overAllAmount: number;
  onlineSale: Record<string, number>;
  offlineSale: Record<string, number>;
  totalOrders: number;
  totalActiveTableValue: number;
}

export interface OtherAndWarningData {
  otherSale: { totalTax: number; totalTip: number; totalServiceCharge: number };
  warningSale: { totalForceSettle: number; totalFreeSettle: number };
}

export interface SalesExceptionData {
  exceptionSale: {
    totalDuesReceived: number;
    totalDuesGiven: number;
    totalNpc: number;
    totalComplementary: number;
    totalDiscount: number;
  };
  rewardSale: {
    totalCoinsGiven: number;
    totalCoinsUsed?: number;
    totalCoinUsed?: number;
    totalCouponUsed?: number;
    totalCouponDiscount?: number;
  };
}

export interface BillsParams extends Range {
  pageNumber?: string;
  appliedFilter?: unknown[];
  outletType: string | null;
}

const toStr = (v: string | number | Date) =>
  typeof v === "string" ? v : String(v);
export const isJewellery = (outletType?: OutletType | null) =>
  outletType?.toLowerCase?.() === businessCardTypes.JEWELLERY;

export async function fetchSalesSummary(
  params: Range & { outletType?: OutletType | null },
): Promise<SalesData> {
  const { businessId, from, to, outletType } = params;
  if (isJewellery(outletType)) {
    const res = await apiRpc.jewellery.payments.dash_boards.summary.$get({
      query: { businessId, from: toStr(from), to: toStr(to) },
    });
    const json = await res.json();
    if (res.status !== 200)
      throw new Error("Failed to fetch jewellery sales summary");
    return json.data as SalesData;
  }
  const res = await apiRpc.payments[":id"].salesDashboard.$get({
    query: { businessId, from: toStr(from), to: toStr(to) },
    param: { id: businessId || "" },
  });
  const json = await res.json();
  if (res.status !== 200) throw new Error("Failed to fetch sales summary");
  return json.data as SalesData;
}

export async function fetchOtherAndWarnings(
  params: Range & { outletType?: OutletType | null },
): Promise<OtherAndWarningData> {
  const { businessId, from, to, outletType } = params;
  if (isJewellery(outletType)) {
    const res =
      await apiRpc.jewellery.payments.dash_boards.other_and_warnings.$get({
        query: { businessId, from: toStr(from), to: toStr(to) },
      });
    const json = await res.json();
    return json.data as OtherAndWarningData;
  }

  const res = await apiRpc.payments.sale.other_and_warnings.$get({
    query: { businessId, from: toStr(from), to: toStr(to) },
  });
  const json = await res.json();
  return json.data as OtherAndWarningData;
}

export async function fetchExceptionAndRewards(
  params: Range & { outletType?: OutletType | null },
): Promise<SalesExceptionData> {
  const { businessId, from, to, outletType } = params;
  if (isJewellery(outletType)) {
    const res =
      await apiRpc.jewellery.payments.dash_boards.exception_and_rewards.$get({
        query: { businessId, from: toStr(from), to: toStr(to) },
      });
    const json = await res.json();
    return json.data as SalesExceptionData;
  }

  const res = await apiRpc.payments.sale.exception_and_rewards.$get({
    query: { businessId, from: toStr(from), to: toStr(to) },
  });
  const json = await res.json();
  return json.data as SalesExceptionData;
}

export async function fetchBills(params: BillsParams): Promise<HistoryData> {
  const { businessId, from, to, pageNumber, appliedFilters, outletType } =
    params;

  if (isJewellery(outletType)) {
    // /jewellery/payments/bills?businessId=&from=&to=
    const res = await apiRpc.jewellery.payments.bills.$get({
      query: {
        businessId,
        from: toStr(from),
        to: toStr(to),
        pageNumber: pageNumber?.toString() ?? 1,
        appliedFilter: JSON.stringify(appliedFilters ?? []),
      },
    });
    const json = await res.json();
    if (res.status !== 200 && res.status !== 201) {
      throw new Error("Failed to fetch jewellery bills");
    }
    return json.data as HistoryData;
  }

  // /payments/:id/bills?businessId=&from=&to=&pageNumber=&appliedFilter=[]
  const res = await apiRpc.payments[":id"].bills.$get({
    param: { id: businessId || "" },
    query: {
      businessId,
      from: toStr(from),
      to: toStr(to),
      pageNumber: pageNumber?.toString() ?? 1,
      appliedFilter: JSON.stringify(appliedFilters ?? []),
    },
  });
  const json = await res.json();
  if (res.status !== 200 && res.status !== 201) {
    throw new Error("Failed to fetch bills");
  }
  return json.data as HistoryData;
}
