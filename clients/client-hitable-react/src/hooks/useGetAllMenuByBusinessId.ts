// src/hooks/useGetAllMenuByBusinessId.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common"; // adjust import
import {
  useBusinessMenuStore,
  type BusinessMenu,
  WeekDay,
} from "@/components/store/useBusinessStore";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";

// Map JS getDay (0–6, Sunday=0) → your WeekDay enum (7,1..6)
const getTodayWeekDay = (): WeekDay => {
  const jsDay = new Date().getDay();
  const map: Record<number, WeekDay> = {
    0: WeekDay.SUNDAY,
    1: WeekDay.MONDAY,
    2: WeekDay.TUESDAY,
    3: WeekDay.WEDNESDAY,
    4: WeekDay.THURSDAY,
    5: WeekDay.FRIDAY,
    6: WeekDay.SATURDAY,
  };
  return map[jsDay];
};

interface UseGetAllMenuByBusinessIdResult {
  menus: BusinessMenu[];
  todayMenus: BusinessMenu[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Hook: fetch all menus by businessId using TanStack Query.
 *
 * - Always hits API when `businessId` changes (unless shouldFetch = false)
 * - Saves latest data to zustand (persisted)
 * - Clears store when businessId is falsy / changes
 * - `todayMenus` = filtered by `days` based on today's weekday
 * - Selection rule:
 *    - if there is selected menu with same business id => keep same menu
 *    - else => pick menu based on today's days/default
 */
export const useGetAllMenuByBusinessId = (
  businessId?: string | null,
  shouldFetch: boolean = true,
): UseGetAllMenuByBusinessIdResult => {
  const storeBusinessId = useBusinessMenuStore((s) => s.businessId);
  const menus = useBusinessMenuStore((s) => s.menus);
  const selectedMenu = useBusinessMenuStore((s) => s.selectedMenu);
  const setBusinessMenus = useBusinessMenuStore((s) => s.setBusinessMenus);
  const setSelectedMenu = useBusinessMenuStore((s) => s.setSelectedMenu);
  const clearBusinessMenus = useBusinessMenuStore((s) => s.clearBusinessMenus);
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const todayWeekDay = getTodayWeekDay();

  // reset when businessId changes / disappears
  if (!businessId) {
    if (storeBusinessId !== null || menus.length > 0) {
      clearBusinessMenus();
    }
  } else if (storeBusinessId && storeBusinessId !== businessId) {
    clearBusinessMenus();
  }

  const enabled = !!businessId && shouldFetch;

  const query = useQuery({
    queryKey: ["menusByBusiness", businessId],
    enabled,
    staleTime: 15 * 60_000,
    queryFn: async () => {
      if (!businessId || !shouldFetch) return [] as BusinessMenu[];

      const res = await apiRpc.menu.menuByBusiness[":businessId"].$get({
        param: { businessId },
      });

      const envelope = await handleEnvelope<BusinessMenu[]>(res);
      const data = (envelope || []) as BusinessMenu[];

      // save menus to store
      setBusinessMenus(businessId, data);

      // --- selection logic ---
      let nextSelected = selectedMenu ?? null;

      const hasExistingSameBusinessSelected =
        nextSelected &&
        nextSelected.businessId === businessId &&
        data.some((m) => m._id === nextSelected!._id);

      if (!hasExistingSameBusinessSelected) {
        // either no selected menu, or previous selection not valid for this data
        const todayMenusFromData = data.filter(
          (menu) =>
            Array.isArray(menu.days) && menu.days.includes(todayWeekDay),
        );

        nextSelected =
          todayMenusFromData.find((m) => m.default) ??
          todayMenusFromData[0] ??
          data.find((m) => m.default) ??
          data[0] ??
          null;

        setSelectedMenu(nextSelected ?? null);
      } else {
        // keep existing selection for this business
        setSelectedMenu(nextSelected);
      }
      // --- end selection logic ---

      return data;
    },
  });

  const todayMenus = useMemo(
    () =>
      menus.filter(
        (menu) => Array.isArray(menu.days) && menu.days.includes(todayWeekDay),
      ),
    [menus, todayWeekDay],
  );

  return {
    menus,
    todayMenus,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => query.refetch(),
  };
};
