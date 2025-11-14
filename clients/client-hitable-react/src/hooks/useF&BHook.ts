// src/hooks/useClientQueries.ts
import { apiRpc } from "@hi/common";
import {
  type QueryObserverResult,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";

import useBusinessData from "@/components/store/useBusinessData";
import { useHiClientZ } from "@/components/store/useHiClientzData";
import { useLiteStore } from "@/components/store/useLiteStore";
import type { Alert, Cart } from "@/components/types/hiClientzData";
import { useErrorHandling } from "@/components/utils/helpers";
import { useFetchAlerts } from "@/utils/apiService";

// ---- helpers ----
export const useBusinessIdFromPath = () => {
  const path = useLocation().pathname;
  return useMemo(() => {
    const m = path.match(/^\/([^/]+)\/alerts/);
    return m ? m[1] : null;
  }, [path]);
};

export type UseOnlineAlertsResult = UseQueryResult<Alert[], unknown> & {
  refetchOnlineAlerts: () => Promise<QueryObserverResult<Alert[], unknown>>;
};

export const useOnlineAlerts = (): UseOnlineAlertsResult => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const isHotel = outletType === "HOTEL";

  const businessId = useBusinessIdFromPath();
  const { fetchAlerts } = useFetchAlerts();
  const { selectedBiz } = useHiClientZ((s) => ({ selectedBiz: s.selectedBiz }));
  const { setOnlineAlertData, setOnlineCount, isSlow } = useLiteStore();

  const handleOnlineAlerts = async (): Promise<Alert[]> => {
    if (!businessId) return [];
    const data: Alert[] = await fetchAlerts(businessId, "ONLINE");
    setOnlineAlertData(data);
    setOnlineCount(data.length);
    return data;
  };

  const query = useQuery<Alert[], unknown>({
    queryKey: ["onlineAlerts", businessId, selectedBiz],
    queryFn: handleOnlineAlerts,
    enabled: !isHotel && !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 31_000 : 17_000,
  });

  return {
    ...query,
    refetchOnlineAlerts: query.refetch,
  };
};

export type UseOfflineAlertsResult = UseQueryResult<Alert[], unknown> & {
  refetchOfflineAlerts: () => Promise<QueryObserverResult<Alert[], unknown>>;
};

export const useOfflineAlerts = (): UseOfflineAlertsResult => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const isHotel = outletType === "HOTEL";

  const businessId = useBusinessIdFromPath();
  const { fetchAlerts } = useFetchAlerts();
  const { selectedBiz } = useHiClientZ((s) => ({ selectedBiz: s.selectedBiz }));

  const setOfflineAlertData = useLiteStore((s) => s.setOfflineAlertData);
  const setOfflineCount = useLiteStore((s) => s.setOfflineCount);
  const isSlow = useLiteStore((s) => s.isSlow);
  const setIsVersionPopup = useLiteStore((s) => s.setIsVersionPopup);
  const setUpdateUrl = useLiteStore((s) => s.setUpdateUrl);
  const setUpdateFeature = useLiteStore((s) => s.setUpdateFeature);

  const version = import.meta.env.VITE_APP_VERSION;

  const handleOfflineAlerts = async (): Promise<Alert[]> => {
    if (!businessId) return [];
    const data: Alert[] = await fetchAlerts(businessId, "ALL");

    setOfflineAlertData(data);
    setOfflineCount(data.length);

    const latest = data?.[0];
    const latestV = typeof latest?.v === "number" ? latest.v : undefined;

    if (typeof latestV === "number")
      setIsVersionPopup(Number(version) !== latestV);
    if (latest?.appUrl) setUpdateUrl(latest.appUrl);
    if (
      typeof latestV === "number" &&
      Number(version) !== latestV &&
      latest?.updateFeature
    ) {
      setUpdateFeature(latest.updateFeature);
    }

    return data;
  };

  const query = useQuery<Alert[], unknown>({
    queryKey: ["offlineAlerts", businessId, selectedBiz],
    queryFn: handleOfflineAlerts,
    enabled: !isHotel && !!businessId && !!selectedBiz,
    refetchInterval: isSlow ? 23_000 : 19_000,
    initialData: [],
  });

  return {
    ...query,
    refetchOfflineAlerts: query.refetch,
  };
};

/* ========================= CARTS ========================= */
export type UseCartsPollResult = UseQueryResult<Cart[], unknown> & {
  refetchCarts: () => Promise<QueryObserverResult<Cart[], unknown>>;
};

export const useCartsPoll = (): UseCartsPollResult => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const isHotel = outletType === "HOTEL";

  const businessId = useBusinessIdFromPath();
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const { isSlow, setCartData, setCartCount } = useLiteStore();
  const { errorText } = useErrorHandling();

  const getAllCarts = async (): Promise<Cart[]> => {
    if (!businessId) return [];

    if (outletInfo?.isPosEnabled) {
      const response = await apiRpc.table.orders[":businessId"].$get({
        param: { businessId },
      });
      if (response.status === 401) {
        errorText();
        return [];
      }
      const res = await response.json();
      const carts = (res.data as Cart[]) ?? [];
      setCartData(carts);
      setCartCount(carts.length || 0);
      return carts;
    }

    const response = await apiRpc.cart.$get({ query: { businessId } });
    if (response.status === 401) {
      errorText();
      return [];
    }
    const res = await response.json();
    const carts = (res.data as Cart[]) ?? [];
    setCartData(carts);
    setCartCount(carts.length || 0);
    return carts;
  };

  const query = useQuery<Cart[], unknown>({
    queryKey: ["carts", businessId],
    queryFn: getAllCarts,
    enabled: !isHotel && !!businessId,
    refetchInterval: isSlow ? 29_000 : 23_000,
    initialData: [],
  });

  return {
    ...query,
    refetchCarts: query.refetch,
  };
};
