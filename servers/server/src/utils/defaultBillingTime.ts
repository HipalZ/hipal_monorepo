const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+05:30
const DAY_MS = 24 * 60 * 60 * 1000;

function istClockToUtcTs(
  year: number,
  month0: number,
  day: number,
  hoursIST: number,
  minutesIST = 0,
): number {
  // Convert IST wall-clock → UTC timestamp
  return Date.UTC(year, month0, day, hoursIST, minutesIST) - IST_OFFSET;
}

export function adjustFromToTimestamps(from?: number, to?: number) {
  const hasFrom = Number.isFinite(from);
  const hasTo = Number.isFinite(to);

  // "Now" in IST
  const nowIST = new Date(Date.now() + IST_OFFSET);
  const Y = nowIST.getFullYear();
  const M = nowIST.getMonth();
  const D = nowIST.getDate();

  // 4 AM boundaries for today/tomorrow/yesterday (UTC timestamps)
  const today4amUTC = istClockToUtcTs(Y, M, D, 4, 0);
  const tomorrow4amUTC = today4amUTC + DAY_MS;
  const yesterday4amUTC = today4amUTC - DAY_MS;

  // ✅ If caller asks only for "today" (from provided, to missing)
  if (hasFrom && !hasTo) {
    const fromIST = new Date((from as number) + IST_OFFSET); // shift into IST
    if (
      fromIST.getFullYear() === Y &&
      fromIST.getMonth() === M &&
      fromIST.getDate() === D
    ) {
      return {
        adjustedFrom: today4amUTC,
        adjustedTo: tomorrow4amUTC, // force 4 AM next day
      };
    }
  }

  // ✅ If both from & to provided → respect the range
  if (hasFrom && hasTo) {
    return { adjustedFrom: from as number, adjustedTo: to as number };
  }

  // ✅ Auto-window logic based on current IST time
  const nowUTC = Date.now();
  if (nowUTC < today4amUTC) {
    // before today’s 4 AM IST → use yesterday window
    return { adjustedFrom: yesterday4amUTC, adjustedTo: today4amUTC };
  }

  // otherwise → today’s window
  return { adjustedFrom: today4amUTC, adjustedTo: tomorrow4amUTC };
}
