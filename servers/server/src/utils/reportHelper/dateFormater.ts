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
  const dateObj = new Date(date);

  // Convert to IST (Indian Standard Time)
  const istOffset = 5.5 * 60; // IST is UTC +5:30, so it's 330 minutes ahead of UTC
  const utcTime = dateObj.getTime(); // Get the UTC time
  const istTime = new Date(utcTime + istOffset * 60 * 1000); // Add IST offset

  // Format the date as DD-MM-YYYY
  const day = String(istTime.getDate()).padStart(2, "0");
  const month = String(istTime.getMonth() + 1).padStart(2, "0");
  const year = istTime.getFullYear();

  return `${day}-${month}-${year}`;
}
