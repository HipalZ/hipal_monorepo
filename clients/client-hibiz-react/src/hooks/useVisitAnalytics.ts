import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

// Two cache layers keep the dashboard instant as data grows:
// 1. Server: aggregations cached in Redis (~3 min TTL) — payload
//    carries generatedAt so the UI can show "data as of".
// 2. Client: React Query holds results for STALE_MS — reloads and
//    tab switches within that window fire ZERO network calls.
const STALE_MS = 5 * 60 * 1000;
const GC_MS = 30 * 60 * 1000;

export interface VisitAnalyticsData {
  range: { from: number; to: number };
  summary: {
    totalVisits: number;
    uniqueVisitors: number;
    newVisitors: number;
    returningVisitors: number;
    repeatRate: number;
    avgVisitsPerVisitor: number;
  };
  lifetime: {
    totalVisits: number;
    uniqueVisitors: number;
    trackedSince: number | null;
  };
  frequencyDistribution: Array<{ bucket: string; customers: number }>;
  dailyTrend: Array<{ day: string; visits: number }>;
  sourceBreakdown: Array<{ source: string; visits: number }>;
  staffBreakdown: {
    staffVisits: number;
    staffVisitors: number;
    customerVisits: number;
    customerVisitors: number;
  };
  topVisitors: Array<{
    userId: string;
    visits: number;
    firstVisit: number;
    lastVisit: number;
    name?: string;
    phone?: string;
    isStaff: boolean;
  }>;
  audience: {
    subscribersTotal: number;
    totalCustomers: number;
    subscribedAndVisited: number;
    subscribedNeverVisited: number;
    visitedNotSubscribed: number;
    readNeverVisited: number;
  };
  generatedAt: number;
  cacheTtlSeconds: number;
}

export interface CampaignConversionData {
  windowDays: number;
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    sentAt: number | null;
    reads: number;
    returnedWithinWindow: number;
    conversionRate: number;
  }>;
  generatedAt: number;
}

export const useVisitAnalytics = (
  businessId?: string,
  from?: number,
  to?: number,
) => {
  return useQuery({
    queryKey: ["visit-analytics", businessId, from ?? null, to ?? null],
    enabled: Boolean(businessId),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async (): Promise<VisitAnalyticsData> => {
      const res = await apiRpc.visits.analytics.$get({
        query: {
          businessId: businessId as string,
          ...(from ? { from: String(from) } : {}),
          ...(to ? { to: String(to) } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load visit analytics");
      return (await res.json()).data as VisitAnalyticsData;
    },
  });
};

export const useCampaignConversion = (businessId?: string) => {
  return useQuery({
    queryKey: ["campaign-conversion", businessId],
    enabled: Boolean(businessId),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
    queryFn: async (): Promise<CampaignConversionData> => {
      const res = await apiRpc.visits["campaign-conversion"].$get({
        query: { businessId: businessId as string },
      });
      if (!res.ok) throw new Error("Failed to load campaign conversion");
      return (await res.json()).data as CampaignConversionData;
    },
  });
};

// "Updated 2 min ago" label from the server-side generation timestamp
export const freshnessLabel = (generatedAt?: number): string => {
  if (!generatedAt) return "";
  const mins = Math.round((Date.now() - generatedAt) / 60_000);
  if (mins < 1) return "updated just now";
  if (mins === 1) return "updated 1 min ago";
  if (mins < 60) return `updated ${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  return `updated ${hrs} hr${hrs > 1 ? "s" : ""} ago`;
};
