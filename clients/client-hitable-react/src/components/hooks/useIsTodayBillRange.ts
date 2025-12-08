// src/hooks/useIsTodayBillRange.ts
import { useMemo } from "react";

type DateInput = string | number | Date | null | undefined;

const toDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const BUSINESS_CUTOFF_HOUR = 4; // 4 AM next day

/**
 * Returns true if the [start, end) range is fully inside
 * today's "business window":
 *
 *  - windowStart: today at 00:00
 *  - windowEnd:   tomorrow at 04:00 (next day before 4 AM)
 *
 * Examples (assuming today = 3 Dec):
 *  ✅ 3 Dec 01:00 → 3 Dec 23:00     → inside window
 *  ✅ 3 Dec 01:00 → 4 Dec 01:00     → inside window
 *  ✅ 3 Dec 23:30 → 4 Dec 03:30     → inside window
 *  ❌ 2 Dec 23:00 → 3 Dec 01:00     → starts before window
 *  ❌ 3 Dec 01:00 → 4 Dec 05:00     → ends after cutoff (4 AM)
 */
export const useIsTodayBillRange = (
  start: DateInput,
  end?: DateInput,
): boolean => {
  return useMemo(() => {
    const startDate = toDate(start);
    const endDate = toDate(end);

    if (!startDate || !endDate) return false;
    if (endDate.getTime() <= startDate.getTime()) return false; // invalid / zero-length

    const now = new Date();

    // Today at 00:00 local time
    const windowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );

    // Tomorrow at 04:00 local time (business cutoff)
    const windowEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      BUSINESS_CUTOFF_HOUR,
      0,
      0,
      0,
    );

    // Show card only if the bill range is fully inside [windowStart, windowEnd)
    const isInsideWindow =
      startDate.getTime() >= windowStart.getTime() &&
      endDate.getTime() <= windowEnd.getTime();

    return isInsideWindow;
  }, [start, end]);
};
