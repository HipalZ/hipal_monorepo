import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export interface RoomId {
  _id: string;
  name: string;
}

export interface UserId {
  _id: string;
  name: string;
  phone: string;
}

export interface AnalyticsItem {
  _id: string;
  businessId: string;
  roomSessionId?: string;
  roomId: RoomId;
  userId: UserId;
  __v: number;
  checkIn: number;
  checkOut: number;
  guestUserIds?: string[];
  reviewIds?: string[];
  serviceIds?: string[];
  source: string;
}

export interface SourcePercentages {
  [source: string]: number;
}

export interface UserAnalyticsData {
  analytics: AnalyticsItem[];
  sourcePercentages: SourcePercentages;
  userCount: number;
}

export interface UserAnalyticsResponse {
  data: UserAnalyticsData;
}

export interface QueryPayload {
  businessId: string;
  from?: string;
  to?: string;
}

const fetchUserAnalytics = async (
  payload: QueryPayload,
): Promise<UserAnalyticsData> => {
  const { businessId, from, to } = payload;

  const res = await apiRpc.hotel.rooms.user_source_analytics.$get({
    query: {
      businessId,
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    },
  });

  if (!res.ok) {
    // surface a useful error message
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch user analytics");
  }

  const json = (await res.json()) as UserAnalyticsResponse;
  return json.data;
};

export const useUsersAnalyticsData = (payload: QueryPayload) => {
  const {
    isLoading,
    data: userAnalyticsData,
    error,
    refetch,
    isFetching,
  } = useQuery<UserAnalyticsData>({
    queryKey: [
      "userAnalytics",
      payload.businessId,
      payload.from ?? null,
      payload.to ?? null,
    ],
    queryFn: () => fetchUserAnalytics(payload),
    enabled: Boolean(payload.businessId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return { isLoading, isFetching, userAnalyticsData, error, refetch };
};

// types/userAnalyticsByUser.ts

export interface ServiceRef {
  name: string;
}

export interface ReviewRef {
  reviewRating: number;
  date: number; // epoch ms
  serviceIds: ServiceRef[];
}

export interface GuestRef {
  name: string;
  phone: string;
}

export interface RoomRef {
  _id: string;
  name: string;
}

export interface UserMini {
  name: string;
  phone: string;
}

export interface UserAnalyticsItemByUser {
  guestUserIds: GuestRef[];
  reviewIds: ReviewRef[];
  serviceIds: ServiceRef[];
  roomId: RoomRef;
  userId: UserMini;
  source: string;
  checkIn: number;
  checkOut: number; 
}

export interface OverAll {
  averageRating: number;
  totalReviews: number;
}

export interface IndividualUserAnalyticsData {
  overAll: OverAll;
  userAnalytics: UserAnalyticsItemByUser[];
}

export interface IndividualUserAnalyticsResponse {
  data: IndividualUserAnalyticsData;
}

type Args = {
  businessId: string;
  userId: string;
};

const normalize = (items: UserAnalyticsItemByUser[]) =>
  (Array.isArray(items) ? items : []).map((b) => ({
    ...b,
    guestUserIds: Array.isArray(b.guestUserIds) ? b.guestUserIds : [],
    reviewIds: Array.isArray(b.reviewIds) ? b.reviewIds : [],
    serviceIds: Array.isArray(b.serviceIds) ? b.serviceIds : [],
    roomId: b.roomId ?? { _id: "", name: "—" },
    userId: b.userId ?? { name: "Guest", phone: "" },
    source: b.source ?? "N/A",
    checkIn: typeof b.checkIn === "number" ? b.checkIn : 0,
    checkOut: typeof b.checkOut === "number" ? b.checkOut : 0,
  }));

const fetchIndividualUserAnalytics = async ({
  businessId,
  userId,
}: Args): Promise<IndividualUserAnalyticsData> => {
  const res = await apiRpc.hotel.rooms.user_analytics.$get({
    query: { businessId, userId },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to fetch individual user analytics");
  }

  const json = (await res.json()) as IndividualUserAnalyticsResponse;

  return {
    overAll: json?.data?.overAll ?? { averageRating: 0, totalReviews: 0 },
    userAnalytics: normalize(json?.data?.userAnalytics ?? []),
  };
};

export const useIndividualUserAnalytics = ({ businessId, userId }: Args) =>
  useQuery<IndividualUserAnalyticsData>({
    queryKey: ["userAnalyticsByUser", businessId, userId],
    queryFn: () => fetchIndividualUserAnalytics({ businessId, userId }),
    enabled: Boolean(businessId && userId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
