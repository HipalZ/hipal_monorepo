const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+05:30

function istClockToUtcTs(
  year: number,
  month0: number,
  day: number,
  hoursIST: number,
  minutesIST = 0,
): number {
  // Create UTC timestamp from IST wall clock
  return Date.UTC(year, month0, day, hoursIST, minutesIST) - IST_OFFSET;
}

export function adjustFromToTimestamps(from: number, to: number) {
  const base = typeof to === "number" ? to : from;

  // Current IST
  const nowIST = new Date(Date.now() + IST_OFFSET);
  const Y = nowIST.getUTCFullYear();
  const M = nowIST.getUTCMonth();
  const D = nowIST.getUTCDate();

  // Today 4am IST
  const today4amUTC = istClockToUtcTs(Y, M, D, 4, 0);

  // Tomorrow 4am IST
  const tomorrow4amUTC = today4amUTC + 24 * 60 * 60 * 1000;

  // Yesterday 4am IST
  const yesterday4amUTC = today4amUTC - 24 * 60 * 60 * 1000;

  // Is base date "today" in IST?
  const baseIST = new Date(base + IST_OFFSET);
  const isToday = nowIST.toDateString() === baseIST.toDateString();

  if (isToday) {
    if (Date.now() + IST_OFFSET < today4amUTC + IST_OFFSET) {
      // Before 4 AM IST → yesterday@4am → today@4am
      return { adjustedFrom: yesterday4amUTC, adjustedTo: today4amUTC };
      // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      // After 4 AM IST → today@4am → tomorrow@4am
      return { adjustedFrom: today4amUTC, adjustedTo: tomorrow4amUTC };
    }
  }

  // Not today → just return original range
  return { adjustedFrom: from, adjustedTo: to };
}
