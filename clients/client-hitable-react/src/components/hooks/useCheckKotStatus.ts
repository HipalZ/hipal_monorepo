// src/hooks/useKotPrintingStatus.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";

export type KotPrintStatus = "IN_PROGRESS" | "FAILED" | "SUCCESS" | string;

export interface KotPrintQueueUser {
  _id: string;
  phone: string;
  name: string;
}

export interface KotPrintQueueEntry {
  _id: string;
  userId: KotPrintQueueUser;
  tableName: string;
  date: number; // timestamp (ms)
  kotPrintStatus: KotPrintStatus;
}

interface UseKotPrintingStatusResult {
  inProgress: KotPrintQueueEntry[];
  failed: KotPrintQueueEntry[];
  inProgressCount: number;
  failedCount: number;
  latestEntry: KotPrintQueueEntry | null;
  latestStatus: KotPrintStatus | "UNKNOWN";
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Hook to fetch KOT printing status entries for a given business.
 *
 * - Uses TanStack Query
 * - Uses your handleEnvelope helper
 * - Separates results into:
 *    - inProgress[]
 *    - failed[]
 *   with counts for both
 * - latestEntry / latestStatus are based on absolute latest date
 */
export const useKotPrintingStatus = (
  businessId?: string,
): UseKotPrintingStatusResult => {
  const { handleEnvelope } = useApiErrorHandler();

  const query = useQuery({
    queryKey: ["kot_print_status", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      if (!businessId) return [] as KotPrintQueueEntry[];

      const res = await apiRpc.print_section.kot_print_queue.$get({
        query: {
          businessId,
        },
      });

      const envelope = await handleEnvelope<KotPrintQueueEntry[]>(res);
      const data = (envelope || []) as KotPrintQueueEntry[];

      return data;
    },
    refetchInterval: 5000, // poll every 5 seconds
  });

  const {
    inProgress,
    failed,
    inProgressCount,
    failedCount,
    latestEntry,
    latestStatus,
  } = useMemo(() => {
    const items = (query.data || []) as KotPrintQueueEntry[];

    if (!items.length) {
      return {
        inProgress: [] as KotPrintQueueEntry[],
        failed: [] as KotPrintQueueEntry[],
        inProgressCount: 0,
        failedCount: 0,
        latestEntry: null,
        latestStatus: "UNKNOWN" as KotPrintStatus | "UNKNOWN",
      };
    }

    // Separate by status
    const inProgressList = items
      .filter((it) => it.kotPrintStatus === "IN_PROGRESS")
      .sort((a, b) => b.date - a.date); // latest first

    const failedList = items
      .filter((it) => it.kotPrintStatus === "FAILED")
      .sort((a, b) => b.date - a.date); // latest first

    const inProgressCountVal = inProgressList.length;
    const failedCountVal = failedList.length;

    // Overall latest by date (not only failed/in-progress, but all)
    const latestByDate = items.reduce((prev, curr) =>
      curr.date > prev.date ? curr : prev,
    );

    return {
      inProgress: inProgressList,
      failed: failedList,
      inProgressCount: inProgressCountVal,
      failedCount: failedCountVal,
      latestEntry: latestByDate,
      latestStatus: latestByDate.kotPrintStatus ?? ("UNKNOWN" as const),
    };
  }, [query.data]);

  return {
    inProgress,
    failed,
    inProgressCount,
    failedCount,
    latestEntry,
    latestStatus,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
