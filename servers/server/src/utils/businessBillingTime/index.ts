function parseHHmm(value?: number) {
  if (!value && value !== 0) return null;

  const hh = Math.floor(value / 100);
  const mm = value % 100;

  return { hh, mm };
}

function makeISTDate(
  dateStr: string, // DD-MM-YYYY
  hh: number,
  mm: number,
  ss = 0,
) {
  const [day, month, year] = dateStr.split("-").map(Number);

  // IST = UTC + 5:30
  return new Date(Date.UTC(year, month - 1, day, hh - 5, mm - 30, ss));
}

export function getBillingRange(
  from: string,
  to: string,
  startBillTime?: number,
) {
  // Default: calendar day (00:00–23:59)
  if (!startBillTime) {
    const fromTs = makeISTDate(from, 0, 0, 0).getTime();
    const toTs = makeISTDate(to, 23, 59, 59).getTime();
    return { fromTs, toTs };
  }

  const parsed = parseHHmm(startBillTime)!;

  // FROM → same date at billing start time
  const fromDate = makeISTDate(from, parsed.hh, parsed.mm, 0);

  // TO → next date at (billing start time - 1 second)
  const [d, m, y] = to.split("-").map(Number);
  const nextDay = new Date(Date.UTC(y, m - 1, d + 1));

  const toDate = new Date(
    Date.UTC(
      nextDay.getUTCFullYear(),
      nextDay.getUTCMonth(),
      nextDay.getUTCDate(),
      parsed.hh - 5,
      parsed.mm - 30,
      -1, // one second before start
    ),
  );

  return {
    fromTs: fromDate.getTime(),
    toTs: toDate.getTime(),
  };
}
