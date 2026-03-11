import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useOrderStore } from "@/components/store/useOrderData";
import {
  isTableMenuCacheStale,
  useTableMenuCacheStore,
} from "@/components/store/useTableMenuCacheStore";

/**
 * Fetches categories (menu) for the current table via GET /table/menu.
 * Uses Approach 1 cache: Zustand + IndexedDB (idb-keyval). Cache key per table, 1h TTL.
 * - Valid cache (memory or IDB) is used immediately; no API call until TTL or "Refresh".
 * - "Refresh Categories" invalidates cache then refetches so updated prices/menu show up.
 */
export const useCategories = () => {
  const { businessId, tableId } = useParams();
  const setAllCategories = useOrderStore((s) => s.setAllCategories);
  const setFirstCat = useOrderStore((s) => s.setFirstCat);
  const getValidCached = useTableMenuCacheStore((s) => s.getValidCached);
  const hydrateFromIdb = useTableMenuCacheStore((s) => s.hydrateFromIdb);
  const setCached = useTableMenuCacheStore((s) => s.setCached);
  const invalidate = useTableMenuCacheStore((s) => s.invalidate);

  const applyCategories = useCallback(
    (categories: CategoryType[]) => {
      setAllCategories(categories);
      setFirstCat(categories);
    },
    [setAllCategories, setFirstCat],
  );

  const getTableMenu = useCallback(async () => {
    const bid = businessId ?? "";
    const tid = tableId ?? "";
    if (!bid || !tid) return [] as CategoryType[];

    // 1) Valid in-memory cache → use immediately
    const mem = getValidCached(bid, tid);
    if (mem) {
      applyCategories(mem.data);
      return mem.data;
    }

    // 2) Try IndexedDB (e.g. after tab reopen)
    const idbEntry = await hydrateFromIdb(bid, tid);
    if (idbEntry && !isTableMenuCacheStale(idbEntry.fetchedAt)) {
      applyCategories(idbEntry.data);
      return idbEntry.data;
    }

    // 3) Fetch from API, then cache and apply
    const res = await apiRpc.table.menu.$get({ query: { businessId: bid, tableId: tid } });
    const json = await res.json();
    const categories = (json.data ?? []) as CategoryType[];
    await setCached(bid, tid, categories);
    applyCategories(categories);
    return categories;
  }, [
    businessId,
    tableId,
    getValidCached,
    hydrateFromIdb,
    setCached,
    applyCategories,
  ]);

  const { isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: ["tableMenu", businessId, tableId],
    queryFn: getTableMenu,
    enabled: !!businessId && !!tableId,
  });

  /** Force fresh data: clear cache for this table then refetch (e.g. "Refresh Categories"). */
  const refetch = useCallback(async () => {
    const bid = businessId ?? "";
    const tid = tableId ?? "";
    if (bid && tid) await invalidate(bid, tid);
    return queryRefetch();
  }, [businessId, tableId, invalidate, queryRefetch]);

  return { isLoading, error, refetch };
};
