import { API_URL } from '@/configs';

export const MAX_REPORT_MONTHS = 3;

/** The export endpoint caps a single download at MAX_REPORT_MONTHS. */
export const isWithinMonthLimit = (from?: number, to?: number, months = MAX_REPORT_MONTHS): boolean => {
  if (!from || !to || to < from) return false;
  const max = new Date(from);
  max.setMonth(max.getMonth() + months);
  return to <= max.getTime();
};

type DownloadArgs = { businessId: string; from: number; to: number };

/**
 * Stream the server-built Guest Experience CSV and save it. The server owns the
 * full dataset + SLA columns, so the client just triggers the file download.
 */
export const downloadGuestExperienceCsv = async ({ businessId, from, to }: DownloadArgs): Promise<void> => {
  const url = new URL(`${API_URL}/hotel/report/guest_experience_csv`);
  url.searchParams.set('businessId', businessId);
  url.searchParams.set('from', String(from));
  url.searchParams.set('to', String(to));

  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'text/csv' },
  });
  if (!res.ok) {
    throw new Error((await res.text().catch(() => '')) || `Server responded ${res.status}`);
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] || `guest_experience_report_${new Date(from || Date.now()).toISOString().slice(0, 10)}.csv`;

  const blob = await res.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
};
