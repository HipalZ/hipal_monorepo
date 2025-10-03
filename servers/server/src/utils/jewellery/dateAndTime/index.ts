export function getTimeDifferenceInMinutes(
  timestamp1: number,
  timestamp2: number,
) {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  // Get difference in milliseconds
  const diffInMs = Math.abs(date2 - date1);

  // Convert to minutes (1 minute = 60,000 milliseconds)
  const diffInMinutes = diffInMs / (1000 * 60);

  return Math.round(diffInMinutes);
}
