import { useQuery, useMutation } from "@tanstack/react-query";
import useBusinessData from "@/components/store/useBusinessData";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useErrorHandling } from "@/components/utils/helpers";
import {
  fetchCarts,
  fetchOnlineAlerts,
  fetchOfflineAlerts,
  fetchAlertHistory,
  fetchCheckInUsers,
  archiveCart,
} from "@/api/hiClientsService";

export function useOnlineAlertsQuery(
  businessId?: string | null,
  isSlow?: boolean,
) {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  if (outletType === "HOTEL") {
    return {
      isLoading: false,
    };
  }

  const setOnlineAlertData = useLiteStore((s) => s.setOnlineAlertData);
  const setOnlineCount = useLiteStore((s) => s.setOnlineCount);

  const { data: onlineAlertsData, refetch } = useQuery({
    queryKey: ["onlineAlerts", outletType, businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const data = await fetchOnlineAlerts(businessId!, outletType);
      setOnlineAlertData(data);
      setOnlineCount(data.length);
      return data;
    },
    refetchInterval: isSlow ? 31000 : 17000,
    staleTime: 10_000,
    refetchIntervalInBackground: true,
  });
  return { onlineAlertsData, refetch };
}

export function useOfflineAlertsQuery(
  businessId?: string | null,
  isSlow?: boolean,
  appVersion?: number,
) {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  if (outletType === "HOTEL") {
    return;
  }

  const setOfflineAlertData = useLiteStore((s) => s.setOfflineAlertData);
  const setOfflineCount = useLiteStore((s) => s.setOfflineCount);
  const setIsVersionPopup = useLiteStore((s) => s.setIsVersionPopup);
  const setUpdateUrl = useLiteStore((s) => s.setUpdateUrl);
  const setUpdateFeature = useLiteStore((s) => s.setUpdateFeature);

  return useQuery({
    queryKey: ["offlineAlerts", outletType, businessId, appVersion],
    enabled: !!businessId,
    queryFn: async () => {
      const data: any[] = await fetchOfflineAlerts(businessId!, outletType);
      setOfflineAlertData(data);
      setOfflineCount(data.length);

      // version/update flags (kept as in your code)
      const v = data?.[0]?.v;
      const appUrl = data?.[0]?.appUrl;
      if (typeof v === "number" && typeof appVersion === "number") {
        setIsVersionPopup(v !== appVersion);
        if (appUrl) setUpdateUrl(appUrl);
        if (v !== appVersion && data?.[0]?.updateFeature) {
          setUpdateFeature(data[0].updateFeature);
        }
      }
      return data;
    },
    refetchInterval: isSlow ? 23000 : 19000,
    staleTime: 10_000,
    refetchIntervalInBackground: true,
  });
}

export function useCartsQuery(businessId?: string | null, isSlow?: boolean) {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const outletType = outletInfo?.outLetType;
  const isPosEnabled = outletInfo?.isPosEnabled;
  if (outletType === "HOTEL") {
    return;
  }
  const errorText = useErrorHandling((s) => s.errorText);
  const setCartData = useLiteStore((s) => s.setCartData);
  const setCartCount = useLiteStore((s) => s.setCartCount);


  return useQuery({
    queryKey: ["carts", outletType, businessId],
    enabled: !!businessId,
    queryFn: async () => {
      try {
        const carts = await fetchCarts(businessId!, outletType,isPosEnabled);
        setCartData(carts);
        setCartCount(carts?.length || 0);
        return carts;
      } catch (e: any) {
        // replicate your 401 behavior
        if (String(e?.message || "").includes("401")) errorText();
        throw e;
      }
    },
    refetchInterval: isSlow ? 29000 : 23000,
    staleTime: 10_000,
    refetchIntervalInBackground: true,
  });
}

export function useAlertHistoryQuery(args: {
  businessId?: string | null;
  from: number | string | Date;
  to: number | string | Date;
  pageNumber?: number | string;
}) {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  if (outletType === "HOTEL") {
    return;
  }

  return useQuery({
    queryKey: [
      "alertHistory",
      outletType,
      args.businessId,
      args.from,
      args.to,
      args.pageNumber,
    ],
    enabled: !!args.businessId && !!args.from && !!args.to,
    queryFn: () =>
      fetchAlertHistory({
        businessId: args.businessId!,
        from: args.from,
        to: args.to,
        pageNumber: args.pageNumber,
        outletType,
      }),
    staleTime: 10_000,
  });
}

export function useArchiveCartMutation() {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  return useMutation({
    mutationFn: (cartId: string) => archiveCart(cartId, outletType),
  });
}

export function useCheckInUsersQuery(args: {
  businessId?: string | null;
  from?: number | string | Date;
  to?: number | string | Date;
  qrId?: string;
}) {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  return useQuery({
    queryKey: [
      "checkInUsers",
      outletType,
      args.businessId,
      args.from,
      args.to,
      args.qrId,
    ],
    enabled: !!args.businessId,
    queryFn: () =>
      fetchCheckInUsers({
        businessId: args.businessId!,
        from: args.from,
        to: args.to,
        qrId: args.qrId,
        outletType,
      }),
    staleTime: 10_000,
  });
}
