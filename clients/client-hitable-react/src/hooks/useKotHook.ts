// hooks/useKotByKitchen.ts
import {
  useQuery,
  type UseQueryResult,
  type QueryObserverResult,
} from "@tanstack/react-query";
import { useLiteStore } from "@/components/store/useLiteStore";
import { useBusinessData } from "@/components/store/useBusinessData";
import { create } from "zustand";
import { apiRpc } from "@hi/common";
import type { KotOrderDoc } from "../components/types/kds";

type KdsLocal = {
  byKitchen: Record<string, KotOrderDoc[]>;
  setByKitchen: (k: string, v: KotOrderDoc[]) => void;
  counts: Record<string, number>;
  setCount: (k: string, n: number) => void;
};
export const useKdsLocal = create<KdsLocal>((set) => ({
  byKitchen: {},
  counts: {},
  setByKitchen: (k, v) =>
    set((s) => ({ byKitchen: { ...s.byKitchen, [k]: v } })),
  setCount: (k, n) => set((s) => ({ counts: { ...s.counts, [k]: n } })),
}));

export type UseKotByKitchenResult = UseQueryResult<KotOrderDoc[], unknown> & {
  refetchKotByKitchen: () => Promise<
    QueryObserverResult<KotOrderDoc[], unknown>
  >;
};

export const useKotByKitchen = (kitchenId?: string): UseKotByKitchenResult => {
  const outletType = useBusinessData((s) => s.outletInfo?.outLetType);
  const isHotel = outletType === "HOTEL";

  const setByKitchen = useKdsLocal((s) => s.setByKitchen);
  const setCount = useKdsLocal((s) => s.setCount);

  const fetcher = async (): Promise<KotOrderDoc[]> => {
    if (!kitchenId) return [];
    const res = await apiRpc.kds.kot[":kitchenId"].$get({
      param: {
        kitchenId,
      },
    });
    if (!res.ok) throw new Error(`KDS fetch failed: ${res.status}`);
    const json = await res.json();
    const orders: KotOrderDoc[] = json?.data ?? [];
    setByKitchen(kitchenId, orders);
    setCount(kitchenId, orders.length);
    return orders;
  };

  const query = useQuery<KotOrderDoc[], unknown>({
    queryKey: ["kot", kitchenId],
    queryFn: fetcher,
    enabled: !!kitchenId && !isHotel,
    // refetchInterval: isSlow ? 31_000 : 17_000,
  });

  return { ...query, refetchKotByKitchen: query.refetch };
};

export type UseKotHistoryResult = UseQueryResult<KotOrderDoc[], unknown> & {
  refetchKotHistory: () => Promise<QueryObserverResult<KotOrderDoc[], unknown>>;
};

export const useKotHistory = (kitchenId?: string): UseKotHistoryResult => {
  const outletInfo = useBusinessData((s) => s.outletInfo);
  const isHotel = outletInfo?.outLetType === "HOTEL";
  const businessId = outletInfo?.businessId;

  const fetcher = async (): Promise<KotOrderDoc[]> => {
    if (!businessId || !kitchenId) return [];
    const res = await apiRpc.kds.kot[":businessId"].history.$get({
      param: { businessId },
      query: { kitchenId },
    });
    if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
    const json = await res.json();
    return (json?.data ?? json ?? []) as KotOrderDoc[];
  };

  const q = useQuery<KotOrderDoc[], unknown>({
    queryKey: ["kotHistory", businessId, kitchenId],
    queryFn: fetcher,
    enabled: !!businessId && !!kitchenId && !isHotel,
    // refetchInterval: 45_000,
  });

  return { ...q, refetchKotHistory: q.refetch };
};
