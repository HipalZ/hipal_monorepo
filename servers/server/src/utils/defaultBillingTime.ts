const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000;

const isToday = (timestamp: number) => {
  const now = new Date();
  const input = new Date(timestamp);
  return (
    now.getFullYear() === input.getFullYear() &&
    now.getMonth() === input.getMonth() &&
    now.getDate() === input.getDate()
  );
};

export function adjustFromToTimestamps(from: number, to: number) {
  const adjustedFrom = from;
  let adjustedTo = to;

  // If both from and to are today → add +4hrs to "to"
  if (isToday(from) && isToday(to)) {
    adjustedTo = to + FOUR_HOURS_IN_MS;
  }

  return { adjustedFrom, adjustedTo };
}
