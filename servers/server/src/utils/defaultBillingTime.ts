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

export function getISTDateRange(givenTs: number) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30

  // Convert timestamp → IST Date
  const givenDateIST = new Date(givenTs + IST_OFFSET);

  // Get today's IST boundaries
  const now = new Date(Date.now() + IST_OFFSET);
  const todayY = now.getUTCFullYear();
  const todayM = now.getUTCMonth();
  const todayD = now.getUTCDate();

  // Start & end of today in IST
  const todayStartIST = Date.UTC(todayY, todayM, todayD, 0, 0) - IST_OFFSET;
  const todayEndIST = todayStartIST + 24 * 60 * 60 * 1000 - 1;

  // Check if given timestamp is today (in IST)
  if (givenTs >= todayStartIST && givenTs <= todayEndIST) {
    // Get hour of given timestamp in IST
    const hourIST = givenDateIST.getUTCHours();
    const minuteIST = givenDateIST.getUTCMinutes();

    // Today 4 AM (in UTC timestamp)
    const today4amUTC = Date.UTC(todayY, todayM, todayD, 4, 0) - IST_OFFSET;
    const tomorrow4amUTC = today4amUTC + 24 * 60 * 60 * 1000;

    if (hourIST < 4) {
      // Case 1: Between 00:00:00 and 03:59:59
      return {
        from: today4amUTC - 24 * 60 * 60 * 1000, // yesterday 4 AM
        to: today4amUTC, // today 4 AM
      };
    } else {
      // Case 2: Between 04:00:00 and 23:59:59
      return {
        from: today4amUTC,
        to: todayEndIST,
      };
    }
  } else {
    return { error: "Given timestamp is not today (IST)" };
  }
}

export function isTodayIST(ts: number): boolean {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // +05:30
  const d = new Date(ts + IST_OFFSET);
  const now = new Date(Date.now() + IST_OFFSET);

  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}
