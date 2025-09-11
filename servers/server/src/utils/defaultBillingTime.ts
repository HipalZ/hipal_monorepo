const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+05:30
const DAY_MS = 24 * 60 * 60 * 1000;

function istClockToUtcTs(
  year: number,
  month0: number,
  day: number,
  hoursIST: number,
  minutesIST = 0,
): number {
  return Date.UTC(year, month0, day, hoursIST, minutesIST) - IST_OFFSET;
}

export function adjustFromToTimestamps(from?: number, to?: number) {
  const hasFrom = Number.isFinite(from);
  const hasTo = Number.isFinite(to);

  const nowIST = new Date(Date.now() + IST_OFFSET);
  const Y = nowIST.getUTCFullYear();
  const M = nowIST.getUTCMonth();
  const D = nowIST.getUTCDate();

  const today4amUTC = istClockToUtcTs(Y, M, D, 4, 0);
  const tomorrow4amUTC = today4amUTC + DAY_MS;
  const yesterday4amUTC = today4amUTC - DAY_MS;

  // 📌 Special case: if caller explicitly asks for "today"
  if (hasFrom && !hasTo) {
    const fromDateIST = new Date((from as number) + IST_OFFSET);
    if (
      fromDateIST.getUTCFullYear() === Y &&
      fromDateIST.getUTCMonth() === M &&
      fromDateIST.getUTCDate() === D
    ) {
      // Force today's sales window: [today@4am → tomorrow@4am]
      return { adjustedFrom: today4amUTC, adjustedTo: tomorrow4amUTC };
    }
  }

  // 📌 If both are provided, keep caller’s custom range untouched
  if (hasFrom && hasTo) {
    return { adjustedFrom: from as number, adjustedTo: to as number };
  }

  // 📌 Auto-window around "today" in IST
  if (Date.now() < today4amUTC) {
    // Before 4 AM IST → yesterday@4 → today@4
    return { adjustedFrom: yesterday4amUTC, adjustedTo: today4amUTC };
  }

  // After 4 AM IST → today@4 → tomorrow@4
  return { adjustedFrom: today4amUTC, adjustedTo: tomorrow4amUTC };
}
