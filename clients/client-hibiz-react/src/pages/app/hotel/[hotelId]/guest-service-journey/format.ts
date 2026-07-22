// Pure formatting helpers for the Guest Experience report.

const IST = 'Asia/Kolkata';

const ordinalDay = (day: number): string => {
  if (day > 3 && day < 21) return `${day}th`;
  return `${day}${(['th', 'st', 'nd', 'rd'][day % 10] as string | undefined) ?? 'th'}`;
};

/** "29th May 2026, 05:45 AM" in IST, or "" when the timestamp is missing. */
export const formatDateTime = (timestamp?: number | null): string => {
  if (!timestamp) return '';
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(timestamp));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${ordinalDay(Number(get('day')))} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')} ${get('dayPeriod').toUpperCase()}`;
};

export const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Compact absolute duration: "4.2m", "1h 10m". */
export const formatMins = (mins: number): string => {
  const value = Math.abs(mins);
  if (value >= 60) {
    const hours = Math.floor(value / 60);
    const minutes = Math.round(value % 60);
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${round1(value)}m`;
};

/** A KPI duration that switches to hours when large (759 min → "12.7 hr"). */
export const formatDuration = (mins: number | null): { value: string; unit: string } => {
  if (mins == null) return { value: '—', unit: '' };
  return mins >= 60 ? { value: String(round1(mins / 60)), unit: 'hr' } : { value: String(round1(mins)), unit: 'min' };
};
