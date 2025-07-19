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
