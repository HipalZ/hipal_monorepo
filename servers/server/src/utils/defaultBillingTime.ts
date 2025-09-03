const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+05:30
const DAY_MS = 24 * 60 * 60 * 1000;

function istClockToUtcTs(
  year: number,
  month0: number,
  day: number,
  hoursIST: number,
  minutesIST = 0,
): number {
  // UTC instant that corresponds to an IST wall-clock time
  return Date.UTC(year, month0, day, hoursIST, minutesIST) - IST_OFFSET;
}

export function adjustFromToTimestamps(from?: number, to?: number) {
  const hasFrom = Number.isFinite(from);
  const hasTo = Number.isFinite(to);

  // If the caller passed a full custom range, don't touch it.
  if (hasFrom && hasTo) {
    return { adjustedFrom: from as number, adjustedTo: to as number };
  }

  // Otherwise, auto-window around "today" in IST
  const nowIST = new Date(Date.now() + IST_OFFSET);
  const Y = nowIST.getUTCFullYear();
  const M = nowIST.getUTCMonth();
  const D = nowIST.getUTCDate();

  const today4amUTC = istClockToUtcTs(Y, M, D, 4, 0);
  const tomorrow4amUTC = today4amUTC + DAY_MS;
  const yesterday4amUTC = today4amUTC - DAY_MS;

  // Before 4 AM IST → use [yesterday@4 → today@4]
  if (Date.now() < today4amUTC) {
    return { adjustedFrom: yesterday4amUTC, adjustedTo: today4amUTC };
  }
  // After 4 AM IST → use [today@4 → tomorrow@4]
  return { adjustedFrom: today4amUTC, adjustedTo: tomorrow4amUTC };
}
