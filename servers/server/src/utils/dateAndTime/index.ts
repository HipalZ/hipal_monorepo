type Shift = { startTime: number; endTime: number };

function sumShiftBreakHours(shiftBreaks: Shift[], nowTs = Date.now()): number {
  // keep only valid ranges, close any open endTime=0 with nowTs
  const ranges = shiftBreaks
    .filter((b) => b.startTime && (b.endTime || b.endTime === 0))
    .map((b) => ({
      start: Math.min(b.startTime, b.endTime || nowTs),
      end: Math.max(b.startTime, b.endTime || nowTs),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  // merge overlapping ranges
  const merged: { start: number; end: number }[] = [];
  for (const r of ranges) {
    if (!merged.length || r.start > merged[merged.length - 1].end) {
      merged.push({ ...r });
    } else {
      merged[merged.length - 1].end = Math.max(
        merged[merged.length - 1].end,
        r.end,
      );
    }
  }

  // sum
  const totalMs = merged.reduce((acc, r) => acc + (r.end - r.start), 0);
  return Number((totalMs / (1000 * 60 * 60)).toFixed(2)); // hours
}

// utils/timeHelpers.ts
export function getFutureSeconds(futureTimestampMs: number): number {
  const nowMs = Date.now();
  const diffMs = futureTimestampMs - nowMs;

  if (diffMs <= 0) {
    return 0; // already past or now
  }

  return Math.floor(diffMs / 1000); // convert ms → seconds
}

export { sumShiftBreakHours };
