export function formatToIST(ts: number, withTime = true): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  };
  if (withTime) {
    Object.assign(opts, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return new Intl.DateTimeFormat("en-IN", opts).format(new Date(ts));
}

export function formatDateToIST(date: number): string {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-GB", opts);
  const parts = formatter.formatToParts(new Date(date));

  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const year = parts.find((p) => p.type === "year")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;

  return `${day}-${month}-${year} ${hour}:${minute}`;
}
