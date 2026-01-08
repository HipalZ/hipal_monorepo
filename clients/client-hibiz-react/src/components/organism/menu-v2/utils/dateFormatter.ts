/**
 * Date Formatter Utility
 * 
 * Helper functions for formatting dates in Menu V2 module.
 */

/**
 * Format date as "23rd Jan" (ordinal day + short month)
 */
export const formatDate = (date: Date | string | number | undefined | null): string => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  
  // Add ordinal suffix (st, nd, rd, th)
  const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  return `${ordinal(day)} ${month}`;
};
